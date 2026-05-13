import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'es',
      name: 'Español',
      flag: '🇪🇸'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-[#d6c8b6] bg-white/80 text-slate-900 hover:bg-[#f4ede2] dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border border-[#e7dccd] bg-[#fffdf9]/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              i18n.language === language.code ? 'bg-[#f4ede2] dark:bg-slate-800' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector; 