import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Pagination,
  Skeleton,
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
  IconClick,
  IconQuestionMark,
  IconBrandGithub,
} from "@tabler/icons-react";
import { RepositorySearchView } from "@/components/repository-search-view";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/client/trpc/api";
import { RepositoryView } from "@/components/repository-view";
import { useForm } from "@mantine/form";
import { SupportedSortsEnum, SupportedLanguagesEnum } from "@/utils/zod";

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
  useEffect(() => {
    findRepositoriesMutation.mutate(form.values);
  }, []);
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
    <Grid m={0} sx={{ height: "100vh", maxHeight: "100vh" }}>
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
          <Button onClick={() => findRepositoriesMutation.mutate(form.values)}>
            <Group>
              <IconClick />
              <Text>Update Search</Text>
              {findRepositoriesMutation.isLoading && <Loader />}
            </Group>
          </Button>
          <RepositorySearchView form={form} />
        </Stack>
      </Grid.Col>
      <Grid.Col
        sx={{
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
        md={9}
        sm={8}
        pt="md"
      >
        <Container size={"lg"}>
          <Stack>
            <Alert
              title={"We help you find open source projects to contribute to."}
              color="gray"
              icon={<IconQuestionMark />}
            >
              <Stack>
                <Text size={"sm"}>
                  Our goal is to make it extremely easy to contribute to open
                  source, with the end goal of enabling people to fix society's
                  biggest issues. Our focus is on repositories with
                  philanthropic applications that are still maturing. Our
                  "impact score" is a measure of how much impact you will have
                  contributing to any given repository.
                </Text>
                <Text>
                  We're open source ourselves and welcome contributions!
                </Text>
                <Anchor
                  href={"https://github.com/aacitelli/contributor.dev"}
                  target={"_blank"}
                >
                  <Button
                    size={"xs"}
                    variant="gradient"
                    gradient={{ from: "#343434", to: "#232323" }}
                    color={"black"}
                  >
                    <Group>
                      <IconBrandGithub size={16} />
                      <Text>GitHub Repo</Text>
                    </Group>
                  </Button>
                </Anchor>
              </Stack>
            </Alert>
            <Title order={3}>Repositories</Title>
            {findRepositoriesMutation.isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} height={100} />
              ))}
            <PaginationComponent />
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
