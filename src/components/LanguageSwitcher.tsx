// components/LanguageSwitcher.tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLangStore } from "@/stores/langStore";
import flagID from "@/assets/images/flag_id.svg";
import flagUS from "@/assets/images/flag_us.svg";

const flagUrls = {
  id: flagID,
  en: flagUS,
};

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLangStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-3">
          <img
            src={flagUrls[language]}
            alt={`${language} flag`}
            className="w-5 h-5 rounded-full"
          />
          <span className="capitalize">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("id")}>
          <img
            src={flagID}
            alt="Indonesia flag"
            className="w-5 h-5 rounded-full mr-2"
          />
          Indonesia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          <img
            src={flagUS}
            alt="English flag"
            className="w-5 h-5 rounded-full mr-2"
          />
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
