import { Anchor, Button, Card, Group, Text, Title } from "@mantine/core";
import { IconBrandGithub, IconStar } from "@tabler/icons-react";
import { RouterOutputs } from "@/client/trpc/api";

export const RepositoryView = ({
  repository,
}: {
  repository: RouterOutputs["repositories"]["findById"];
}) => {
  return (
    <Card withBorder>
      <Group position={"apart"}>
        <Group>
          <Group spacing={"xs"}>
            <Text size={"sm"}>{repository.owner}</Text>/
            <Title order={5}>{repository.name}</Title>
          </Group>
        </Group>
        <Group>
          <Group>
            <IconStar />
            <Text>{repository.numStars}</Text>
          </Group>
        </Group>
      </Group>

      <Text size={"sm"}>{repository.description}</Text>

      <Group position={"apart"} mt={"xs"}>
        <Group>
          <Anchor href={repository.url} target={"_blank"}>
            <Button
              size={"xs"}
              variant="gradient"
              gradient={{ from: "#343434", to: "#232323" }}
              color={"black"}
            >
              <Group>
                <IconBrandGithub size={16} />
                <Text>Visit</Text>
              </Group>
            </Button>
          </Anchor>
        </Group>
      </Group>
    </Card>
  );
};
