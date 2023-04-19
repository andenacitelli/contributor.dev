import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Title,
} from "@mantine/core";
// Test change
import { useForm } from "@mantine/form";
import { IconInfoCircle, IconMoodHappy } from "@tabler/icons-react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";

import { CardListView } from "@/components/card-list-view";
import { SearchFormView } from "@/components/search-form";
import { DEFAULT_VALUATIONS } from "@/data/valuations";
import {
  CreditCard,
  CurrenciesEnum,
  IssuersEnum,
  NetworksEnum,
} from "@/generated/open-api-zod";
import { useCreditCards } from "@/hooks/use-credit-cards";
import { Filters, FiltersSchema } from "@/server/api/routers/schemas";
import { api } from "@/utils/api";
import { getCardValue, VALUATION_METHODS } from "@/utils/calculations";
import { CardReason, getIneligibleCards } from "@/utils/eligibility";
import { cardMatchesFilters } from "@/utils/filter";

export const DEFAULT_FORM_VALUES: Filters = {
  name: "",
  issuers: Object.values(IssuersEnum.enum),
  networks: Object.values(NetworksEnum.enum),
  valuationMethod: VALUATION_METHODS.DEFAULT,
  isMilitary: "No",
  businessOrPersonal: ["Business", "Personal"],
  currentUniversalCashbackCurrency: CurrenciesEnum.enum.USD,
  currentUniversalCashback: 1,
  maximumSpend: undefined,
  minimumSpend: undefined,
  minimumAnnualFee: undefined,
  maximumAnnualFee: undefined,
  maximumMonthlySpend: undefined,
  showCardsThatCountTowards524: ["Yes", "No"],
  minimumValue: 0,
  minimumPercentOfHistoricalMax: "All",
  customValuations: DEFAULT_VALUATIONS,
  travelOrCashback: ["Travel", "Cashback"],
};

interface StoreType {
  data: CreditCard[];
  setData: (data: CreditCard[]) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export const useStore = create<StoreType>((set) => ({
  filters: DEFAULT_FORM_VALUES,
  setFilters: async (filters: Filters) => {
    set({ filters });
  },
  data: [],
  setData: (data: CreditCard[]) => {
    set({ data });
  },
}));

export const enumToText = (enumValue: string) => {
  return enumValue
    .split("_")
    .map((word) =>
      word === "OF" ? "of" : word[0] + word.slice(1).toLowerCase()
    )
    .join(" ");
};

const Home: NextPage = () => {
  const session = useSession();
  const { filters, setFilters } = useStore();
  const updateFilters = api.filters.update.useMutation();

  const userFilters = api.filters.get.useQuery(undefined, {
    enabled: !!session.data,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const userCards = api.cards.findAll.useQuery(undefined, {
    enabled: !!session.data,
  });

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const form = useForm({ initialValues: DEFAULT_FORM_VALUES });

  useEffect(() => {
    //* Load values from server
    if (userFilters.data) {
      console.debug(`Loaded form values from server`, userFilters.data);
      form.setValues(JSON.parse(userFilters.data));
    }
  }, [userFilters.data]);

  useEffect(() => {
    //* Process form value changes
    console.log(form.values);
    try {
      FiltersSchema.parse(form.values);
    } catch (error) {
      console.error(`Invalid filters:`, form.values, error);
      return;
    }

    setFilters(form.values);
    if (
      userFilters.isSuccess &&
      JSON.stringify(userFilters.data) !== JSON.stringify(form.values)
    ) {
      console.log(`Updating filters on server`, form.values);
      updateFilters.mutate({ filters: JSON.stringify(form.values) });
    }
  }, [form.values]);

  const CREDIT_CARDS = useCreditCards();
  const [ineligibleCards, setIneligibleCards] = useState<CardReason[]>([]);
  useEffect(() => {
    const refresh = async () => {
      if (!userCards.data || !CREDIT_CARDS) return;
      const data = await getIneligibleCards(userCards.data, CREDIT_CARDS);
      setIneligibleCards(data);
    };
    refresh().catch((error) => console.error(error));
  }, [CREDIT_CARDS, userCards.data]);

  const cards = useMemo(() => {
    //* Recalculate cards based on filters
    setPage(1);
    return CREDIT_CARDS.filter((card) =>
      cardMatchesFilters(card, filters)
    ).filter((card) => {
      const filteredIneligibleCards = ineligibleCards.filter(
        (reason: CardReason) => reason.reasons.length
      );
      return !filteredIneligibleCards.some(
        (reason: CardReason) =>
          reason.card.name === card.name && reason.card.issuer === card.issuer
      );
    });
  }, [CREDIT_CARDS, filters, userCards.data, ineligibleCards]);

  return (
    <Grid
      m={0}
      sx={{ height: "calc(100vh - 50px)", maxHeight: "calc(100vh - 50px)" }}
    >
      <Grid.Col md={3} sm={4} p={0}>
        {/*<MediaQuery styles={{md: {display: "none"}}} query={"(min-width: 768px)"}>*/}
        {/*    <ActionIcon  onClick={() => setShowFilters(!showFilters)} icon={<IconFilter/>} position={"fixed"}*/}
        {/*                    top={"lg"} right={"lg"} zIndex={1}/>*/}
        {/*</MediaQuery>*/}
        <Box
          px={"md"}
          pb={"lg"}
          sx={{ maxHeight: "calc(100vh - 50px)", overflowY: "scroll" }}
        >
          <SearchFormView form={form} ineligibleCards={ineligibleCards} />
        </Box>
      </Grid.Col>
      <Grid.Col
        sx={{
          height: "calc(100vh - 50px)",
          maxHeight: "calc(100vh - 50px)",
          overflowY: "auto",
        }}
        md={9}
        sm={8}
        py="lg"
      >
        <Container size={"lg"} mb={"xl"}>
          <Stack>
            <Title order={3}>
              Credit Cards ({cards.length}/{CREDIT_CARDS.length})
            </Title>
            <Alert icon={<IconInfoCircle />} color={"gray"}>
              We now pull data directly from the{" "}
              <Anchor
                href={"https://github.com/aacitelli/credit-card-bonuses-api"}
              >
                Companion API
              </Anchor>
              . Please create issues or pull requests if you have feature
              requests or data is outdated!
            </Alert>
            <Alert icon={<IconMoodHappy />} color={"green"}>
              We're getting rid of the premium plan! If you'd still like to
              support the site, use a referral link.
            </Alert>
            <CardListView
              cards={cards
                .sort((cardA, cardB) => {
                  const aValue = getCardValue(cardA, form.values);
                  const bValue = getCardValue(cardB, form.values);
                  return bValue - aValue;
                })
                .slice(0, page * PAGE_SIZE)}
            />
            {cards.length > 0 && cards.length > page * PAGE_SIZE && (
              <Button
                mt={"sm"}
                fullWidth
                variant={"gradient"}
                onClick={() => setPage(page + 1)}
              >
                Show More
              </Button>
            )}
          </Stack>
        </Container>
      </Grid.Col>
    </Grid>
  );
};
export default Home;
