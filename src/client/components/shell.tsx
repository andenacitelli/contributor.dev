import {
    AppShell,
    Burger,
    Group,
    Header,
    MediaQuery,
    Navbar,
    Stack,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
} from "@mantine/core";
import {IconSearch,} from "@tabler/icons-react";
import Link from "next/link";
import {ReactNode, useState} from "react";

export type NavbarLinkData = {
    icon: ReactNode;
    label: string;
    link: string;
};

export const Shell = ({
                          children,
                      }: {
    children: ReactNode | ReactNode[];
}) => {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <AppShell
            styles={{
                main: {
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                },
            }}
            sx={{position: "relative"}}
            padding={0}
            navbarOffsetBreakpoint="md"
            navbar={
                <Navbar
                    p="xs"
                    hiddenBreakpoint="md"
                    hidden={!opened}
                    width={{base: 250}}
                >
                    <Stack spacing={"xl"}>
                        <NavbarLink icon={<IconSearch/>} label={"Home"} link={"/"}/>
                    </Stack>
                </Navbar>
            }
            header={
                <Header height={{base: 50}} p="md">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        <Group position={"apart"} w={"100%"}>
                            <MediaQuery largerThan="md" styles={{display: "none"}}>
                                <Burger
                                    opened={opened}
                                    onClick={() => setOpened((o) => !o)}
                                    size="sm"
                                    mr="xl"
                                />
                            </MediaQuery>
                        </Group>
                    </div>
                </Header>
            }
        >
            {children}
        </AppShell>
    );
};

const NavbarLink = ({icon, label, link}: NavbarLinkData) => {
    return (
        <Link href={link} style={{textDecoration: "none"}}>
            <UnstyledButton
                sx={(theme) => ({
                    display: "block",
                    width: "100%",
                    padding: `5px ${theme.spacing.sm}`,
                    borderRadius: theme.radius.sm,
                    color:
                        theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
                    "&:hover": {
                        backgroundColor:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[6]
                                : theme.colors.gray[0],
                    },
                })}
            >
                <Group>
                    <ThemeIcon>{icon}</ThemeIcon>
                    <Text size="md">{label}</Text>
                </Group>
            </UnstyledButton>
        </Link>
    );
};
