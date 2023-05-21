import {
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
import { useForm } from "@mantine/form";
import {
  IconApiApp,
  IconBrain,
  IconBrandGithub,
  IconClick,
} from "@tabler/icons-react";
import { NextPage } from "next";
import { useEffect, useMemo } from "react";
import { z } from "zod";

import { api } from "@/client/trpc/api";
import { RepositorySearchView } from "@/components/repository-search-view";
import { RepositoryView } from "@/components/repository-view";
import { SupportedLanguagesEnum, SupportedSortsEnum } from "@/utils/zod";

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
  }, [findRepositoriesMutation, form.values]);
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
          <Title order={5}>We help you contribute to open source.</Title>
          <Text size={"sm"}>
            We measure the potential impact of repositories and use GPT and
            Vector Search to get you personalized recommendations.
          </Text>
          <Group>
            <Anchor
              href={"https://github.com/aacitelli/contributor.dev"}
              target={"_blank"}
            >
              <Button
                size={"xs"}
                variant="gradient"
                gradient={{ from: "#343434", to: "#232323" }}
              >
                <Group>
                  <IconBrandGithub size={16} />
                  <Text>GitHub Repo</Text>
                </Group>
              </Button>
            </Anchor>
            <Anchor
              href={
                "https://aacitelli.notion.site/Technical-Deep-Dive-dd8af3d49c0c450d9ee03c7f7621bc92"
              }
              target={"_blank"}
            >
              <Button size={"xs"} variant={"outline"}>
                <Group>
                  <IconBrain size={16} />
                  <Text>Technical Writeup</Text>
                </Group>
              </Button>
            </Anchor>
          </Group>
          <Box>
            <hr />
          </Box>

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
            <Title order={3}>Repositories</Title>
            <Button
              onClick={() => findRepositoriesMutation.mutate(form.values)}
            >
              <Group>
                <IconClick />
                <Text>Search</Text>
                {findRepositoriesMutation.isLoading && <Loader />}
              </Group>
            </Button>
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
