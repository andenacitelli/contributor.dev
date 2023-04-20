import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import {
  IconMoodHappy,
  IconInfoCircle,
  IconHammer,
  IconApiApp,
} from "@tabler/icons-react";
import { RepositorySearchView } from "@/components/repository-search-view";
import { z } from "zod";
import { useMemo, useState } from "react";
import { api } from "@/client/trpc/api";
import { RepositoryView } from "@/components/repository-view";
import { useForm } from "@mantine/form";
import { SupportedSortsEnum, SupportedLanguagesEnum } from "@/utils/enums";

export const FiltersSchema = z.object({
  prompt: z.string().max(512).optional(),
  sort: SupportedSortsEnum,
  name: z.string(),
  languages: z.array(SupportedLanguagesEnum),
  page: z.number().int().min(1),
});

export type Filters = z.infer<typeof FiltersSchema>;

const Home: NextPage = () => {
  const initialValues: Filters = {
    sort: SupportedSortsEnum.enum.STARS,
    name: "",
    languages: Object.values(SupportedLanguagesEnum._def.values),
    page: 1,
  };
  const form = useForm({
    initialValues,
  });

  const findRepositoriesMutation = api.repositories.findAll.useMutation();
  const repositories = useMemo(
    () => findRepositoriesMutation.data ?? [],
    [findRepositoriesMutation]
  );

  const PaginationComponent = () => {
    return (
      <Pagination
        value={form.values.page}
        onChange={(v) => form.setFieldValue("page", v)}
        total={(repositories?.length ?? 100) / 10}
      />
    );
  };

  return (
    <Grid
      m={0}
      sx={{ height: "calc(100vh - 50px)", maxHeight: "calc(100vh - 50px)" }}
    >
      <Grid.Col
        md={3}
        sm={4}
        p={"sm"}
        sx={{ overflowY: "auto", borderRight: "0.1rem solid #2C2E33" }}
      >
        <Stack>
          <Group>
            <IconApiApp />
            <Title order={5}>contributor.dev</Title>
          </Group>
          <Text size={"sm"}>
            Our goal is to make it extremely easy to contribute to open source.
            We're open source ourselves - check us out{" "}
            <Anchor href={"https://github.com/aacitelli/contributor.dev"}>
              on GitHub
            </Anchor>
            !
          </Text>
          <Button onClick={() => findRepositoriesMutation.mutate(form.values)}>
            Find Repositories
          </Button>
          <RepositorySearchView form={form} />
        </Stack>
      </Grid.Col>
      <Grid.Col
        sx={{
          height: "calc(100vh - 50px)",
          maxHeight: "calc(100vh - 50px)",
          overflowY: "auto",
        }}
        md={9}
        sm={8}
        pt="md"
      >
        <Container size={"lg"}>
          <Stack>
            <Title order={3}>Repositories</Title>
            <PaginationComponent />
            <Alert
              color={"yellow"}
              icon={<IconHammer />}
              title={"Under Construction"}
            >
              We're currently building the site out. Check back in a week or
              two!
            </Alert>
            {repositories.map((repository) => (
              <RepositoryView key={repository.id} repository={repository} />
            ))}
            <PaginationComponent />
          </Stack>
        </Container>
      </Grid.Col>
    </Grid>
  );
};
export default Home;
