import {
  IconBrandCpp,
  IconBrandGolang,
  IconBrandJavascript,
  IconBrandPhp,
  IconBrandPython,
  IconBrandTypescript,
  IconCoffee,
  IconDiamond,
  IconLetterC,
  IconList,
} from "@tabler/icons-react";
import { SupportedLanguagesEnum } from "@/utils/zod";

export const languageIconMap = {
  [SupportedLanguagesEnum.enum.TypeScript]: (
    <IconBrandTypescript color={"lightblue"} />
  ),
  [SupportedLanguagesEnum.enum.Python]: <IconBrandPython color={"yellow"} />,
  [SupportedLanguagesEnum.enum.JavaScript]: (
    <IconBrandJavascript color={"yellow"} />
  ),
  [SupportedLanguagesEnum.enum.C]: <IconLetterC color={"lightblue"} />,
  [SupportedLanguagesEnum.enum["C++"]]: <IconBrandCpp color={"lightblue"} />,
  [SupportedLanguagesEnum.enum["C#"]]: <IconLetterC color={"lightblue"} />,
  [SupportedLanguagesEnum.enum.Go]: <IconBrandGolang color={"lightblue"} />,
  [SupportedLanguagesEnum.enum.Java]: <IconCoffee color={"orange"} />,
  [SupportedLanguagesEnum.enum.PHP]: <IconBrandPhp color={"purple"} />,
  [SupportedLanguagesEnum.enum.Ruby]: <IconDiamond color={"red"} />,
  [SupportedLanguagesEnum.enum.Scala]: <IconList color={"red"} />,
};
