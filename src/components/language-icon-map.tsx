import { IconBrandPython, IconBrandTypescript } from "@tabler/icons-react";
import { SupportedLanguagesEnum } from "@/utils/enums";

export const languageIconMap = {
  [SupportedLanguagesEnum.enum.TypeScript]: (
    <IconBrandTypescript color={"lightblue"} />
  ),
  [SupportedLanguagesEnum.enum.Python]: <IconBrandPython color={"yellow"} />,
};
