export type Locale = 'en' | 'fr';

const translations = {
  en: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    inDays: (n: number) => `In ${n}d`,
    overdue: (n: number) => `${n}d overdue`,
    empty: (label: string) => `No issues found. Add the \`${label}\` label to Linear issues to display them here.`,
    dateLocale: 'en-GB',
  },
  fr: {
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    inDays: (n: number) => `Dans ${n}j`,
    overdue: (n: number) => `En retard de ${n}j`,
    empty: (label: string) => `Aucune issue trouvée. Ajoutez le label \`${label}\` dans Linear pour les afficher ici.`,
    dateLocale: 'fr-FR',
  },
} as const;

export function getT(locale: string): typeof translations['en'] {
  return translations[locale as Locale] ?? translations.en;
}
