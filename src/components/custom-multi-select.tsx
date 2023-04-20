import { useState } from "react";
import { Input, Button, Checkbox, Stack, Anchor } from "@mantine/core";
export const CustomMultiSelect = ({
  label,
  get,
  set,
  defaultValue,
  disabled = false,
}: {
  label?: string;
  get: () => string[];
  set: (v: string[]) => void;
  defaultValue: string[];
  disabled?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const DEFAULT_SIZE = 5;
  return (
    <Input.Wrapper label={label ?? undefined} mt={"5px"}>
      {defaultValue.length > 3 && (
        <Button
          size="xs"
          ml="sm"
          variant={"outline"}
          onClick={() =>
            set(get().length === defaultValue.length ? [] : defaultValue)
          }
        >
          Toggle All
        </Button>
      )}

      <Checkbox.Group
        value={get()}
        onChange={(v) => {
          set(v);
        }}
      >
        <Stack>
          {defaultValue
            .slice(0, expanded ? defaultValue.length : DEFAULT_SIZE)
            .map((type) => {
              return (
                <Checkbox
                  key={type}
                  label={type}
                  value={type}
                  disabled={disabled}
                />
              );
            })}
        </Stack>
      </Checkbox.Group>
      {defaultValue.length > DEFAULT_SIZE && (
        <>
          {!expanded && (
            <Anchor size="sm" mt="xs" onClick={() => setExpanded(true)}>
              Show More
            </Anchor>
          )}
          {expanded && (
            <Anchor size="sm" mt="xs" onClick={() => setExpanded(false)}>
              Show Less
            </Anchor>
          )}
        </>
      )}
    </Input.Wrapper>
  );
};
