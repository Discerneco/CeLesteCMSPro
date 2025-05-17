import { derived } from 'svelte/store';
import { languageStore } from './language';
import en from './messages/en.json';
import ptBr from './messages/pt-br.json';

const messagesMap = {
  'en': en,
  'pt-br': ptBr
};

// Export a derived store that updates when the language changes
export const messages = derived(languageStore, (lang) => messagesMap[lang] || messagesMap['en']);

// Re-export language functions
export * from './language';
