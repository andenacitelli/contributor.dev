import {Stack, Textarea, TextInput, Title} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";

import {Filters} from "@/pages";

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
        </Stack>
    );
};
