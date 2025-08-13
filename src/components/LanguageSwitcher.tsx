import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { LanguageOption } from '../types/financial';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const languages: LanguageOption[] = [
    {code: 'ar', name: 'العربية', flag: '🇸🇦'},
    {code: 'de', name: 'Deutsch', flag: '🇩🇪'},
    {code: 'en', name: 'English', flag: '🇬🇧'},
    {code: 'ru', name: 'Русский', flag: '🇷🇺'},
    {code: 'tr', name: 'Türkçe', flag: '🇹🇷'},
    {code: 'uk', name: 'Українська', flag: '🇺🇦'}
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <span>{currentLanguage.flag}</span>
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
