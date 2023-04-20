import { Filters } from "@/pages";
import { UseFormReturnType } from "@mantine/form";
import { Box, Button, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { CustomMultiSelect } from "@/components/custom-multi-select";
import { z } from "zod";
import { SupportedLanguagesEnum } from "@/utils/zod";
import { api } from "@/client/trpc/api";

export const RepositorySearchView = ({
  form,
}: {
  form: UseFormReturnType<Filters>;
}) => {
  return (
    <Stack>
      <Title order={5}>Filters</Title>
      <Textarea
        {...form.getInputProps("prompt")}
        label="Prompt"
        description={
          "Explain the tech you know and the causes you want to contribute to, and our chatbot will find you the best matches!"
        }
      />
      <TextInput
        {...form.getInputProps("name")}
        label="Filter by Name"
        description={"Only repositories with matching names will be shown."}
      />
      <CustomMultiSelect
        get={() => form.values.languages}
        set={(v) => {
          form.setValues({
            ...form.values,
            languages: z.array(SupportedLanguagesEnum).parse(v),
          });
        }}
        defaultValue={Object.values(SupportedLanguagesEnum._def.values)}
        label={"Filter by Language"}
      />
    </Stack>
  );
};
