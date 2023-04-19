import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { CustomLoader, CustomLoaderSmall } from "@packages/ui/src/loaders";
import { PageWrapper } from "@packages/ui/src/page-wrapper";
import {
  IconAlertTriangle,
  IconEdit,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import format from "date-fns/format";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { CreditCard, IssuersEnum } from "@/generated/open-api-zod";
import { useCreditCards } from "@/hooks/use-credit-cards";
import { enumToText } from "@/pages/index";
import { UserCreditCard } from "@/server/api/routers/schemas";
import { api, RouterInputs } from "@/utils/api";

const NewCardForm = () => {
  const session = useSession();
  const userCards = api.cards.findAll.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });
  const createUserCard = api.cards.save.useMutation({
    onSuccess: () => userCards.refetch(),
  });

  const initialValues: RouterInputs["cards"]["save"] = {
    name: "",
    issuer: "",
    applicationDate: new Date(),
  };
  const form = useForm({ initialValues });

  const CREDIT_CARDS = useCreditCards();

  return (
    <Box>
      <form>
        <SimpleGrid cols={3} mb={"sm"}>
          <Select
            searchable
            data={Object.values(IssuersEnum.enum)
              .sort()
              .map((issuer) => {
                return {
                  label: enumToText(issuer),
                  value: issuer,
                };
              })}
            {...form.getInputProps("issuer")}
            label={"Issuer"}
            withinPortal
          />
          <Select
            searchable
            data={CREDIT_CARDS.filter(
              (card) => card.issuer === form.values.issuer
            )
              .map((card) => card.name)
              .sort()}
            {...form.getInputProps("name")}
            label={"Card"}
            withinPortal
          />
          <DatePickerInput
            {...form.getInputProps("applicationDate")}
            label="Application Date"
            maxDate={new Date()}
            dropdownType={"modal"}
          />
        </SimpleGrid>
        <Button
          mb={"sm"}
          variant={"gradient"}
          fullWidth
          onClick={() => createUserCard.mutate(form.values)}
          disabled={session.status !== "authenticated"}
        >
          Create {createUserCard.isLoading && <CustomLoaderSmall />}
        </Button>
      </form>
    </Box>
  );
};

const CardView = ({ card }: { card: UserCreditCard }) => {
  const theme = useMantineTheme();
  const session = useSession();
  const CREDIT_CARDS = useCreditCards();

  const refetchUserCards = api.cards.findAll.useQuery(undefined, {
    enabled: !!session.data,
  }).refetch;

  const deleteCard = api.cards.delete.useMutation({
    onSuccess: () => refetchUserCards(),
  });
  const updateCard = api.cards.update.useMutation({
    onSuccess: () => refetchUserCards(),
  });
  const cardString = useMemo(() => {
    return card.issuer + " " + card.name;
  }, [card]);

  const match: CreditCard | undefined = useMemo(() => {
    return CREDIT_CARDS.find(
      (c) => c.name === card.name && c.issuer === card.issuer
    );
  }, [card, cardString, CREDIT_CARDS]);
  if (CREDIT_CARDS && !match) {
    console.error(`Could not find card ${cardString}`);
  }

  const form = useForm({
    initialValues: card,
  });

  const [editing, setEditing] = useState(false);

  return (
    <Card
      key={cardString}
      withBorder
      p={"sm"}
      sx={{
        borderLeft: `5px ${theme.colors.blue[5]} solid`,
      }}
      pos={"relative"}
    >
      <LoadingOverlay visible={deleteCard.isLoading} />
      {!editing && (
        <div>
          <Group position={"apart"}>
            <Group spacing={"xs"}>
              {match && (
                <Image
                  src={match?.imageUrl ?? "/images/amex/platinum.webp"}
                  alt={cardString}
                  width={120}
                  height={75}
                />
              )}
              {!match && <Skeleton width={120} height={75} />}
              <Box>
                <Title order={4}>{card.name}</Title>
                <Text>{enumToText(card.issuer)}</Text>
                <Text>Applied {format(card.applicationDate, "MMM d, y")}</Text>
              </Box>
            </Group>
            <Group>
              <Button variant={"gradient"} onClick={() => setEditing(true)}>
                <IconEdit />
              </Button>
              <Button
                color={"red"}
                onClick={() => deleteCard.mutate({ id: card.id })}
              >
                <IconTrash />
                {deleteCard.isLoading && <CustomLoaderSmall />}
              </Button>
            </Group>
          </Group>
        </div>
      )}

      {editing && (
        <div>
          <SimpleGrid cols={3} mb={"sm"}>
            <Select
              dropdownPosition={"bottom"}
              data={Object.values(IssuersEnum.enum).sort()}
              {...form.getInputProps("issuer")}
              label={"Issuer"}
              withinPortal
            />
            <Select
              dropdownPosition={"bottom"}
              data={CREDIT_CARDS.filter(
                (card) => card.issuer === form.values.issuer
              )
                .map((card) => card.name)
                .sort()}
              {...form.getInputProps("name")}
              label={"Card Name"}
              withinPortal
            />
            <DatePickerInput
              {...form.getInputProps("applicationDate")}
              label={"Application Date"}
              maxDate={new Date()}
              dropdownType={"modal"}
            />
          </SimpleGrid>
          <Button fullWidth onClick={() => updateCard.mutate(form.values)}>
            <Text>Save Changes</Text>
            {updateCard.isLoading && <CustomLoaderSmall />}
          </Button>
        </div>
      )}
    </Card>
  );
};

const UserCards = () => {
  const session = useSession();
  const userCards = api.cards.findAll.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  if (session.status === "unauthenticated") {
    return (
      <Container mt={"xl"}>
        <Alert
          mb={"sm"}
          color={"red"}
          icon={<IconAlertTriangle />}
          title={"You must be signed in to access this page."}
        >
          Please click the button below and sign in via any of the OAuth
          providers.
        </Alert>
        <Button variant={"gradient"} onClick={() => signIn()}>
          Sign in
        </Button>
      </Container>
    );
  }

  return (
    <Stack>
      {userCards.data && userCards.data.length === 0 && (
        <Alert color={"gray"} icon={<IconInfoCircle />}>
          {"You don't have any cards yet. Create a new one above!"}
        </Alert>
      )}
      <Stack>
        {userCards.isLoading && <CustomLoader />}
        {userCards.data &&
          userCards.data
            .sort(
              (a: UserCreditCard, b: UserCreditCard) =>
                b.applicationDate.getTime() - a.applicationDate.getTime()
            )
            .map((card: UserCreditCard) => (
              <CardView key={card.issuer + card.name} card={card} />
            ))}
      </Stack>
    </Stack>
  );
};

const CardsPageView = () => {
  return (
    <PageWrapper>
      <Title order={4}>My Cards</Title>
      <Text>
        When you fill in your cards and application dates here, the main search
        page will automatically filter them out based on various eligibility
        rules. If you have no clue what {"I'm"} talking about, you can find a
        nice list of all the rules{" "}
        <Anchor
          href={
            "https://www.reddit.com/r/churning/comments/819r08/list_of_antichurning_rules/"
          }
        >
          here
        </Anchor>
        .
      </Text>
      <NewCardForm />
      <UserCards />
    </PageWrapper>
  );
};

export default CardsPageView;
