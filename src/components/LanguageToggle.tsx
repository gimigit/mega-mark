'use client'

import {useTranslations} from '@/i18n/I18nProvider'
import {Button} from '@/components/ui/button'

export default function LanguageToggle() {
  const {locale, setLocale} = useTranslations()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'ro' ? 'en' : 'ro')}
      className="w-12 h-8 px-1 font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
    >
      {locale.toUpperCase()}
    </Button>
  )
}