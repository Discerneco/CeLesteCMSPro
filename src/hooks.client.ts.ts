import { setLocale, getLocale } from '$lib/paraglide/runtime.js';
import { browser } from '$app/environment';

if (browser) {
  // 🎯 Initialize language from localStorage on page load
  const savedLanguage = localStorage.getItem('celestecms-language');
  const currentLocale = getLocale();
  
  console.log('🔍 Language detection:', {
    saved: savedLanguage,
    current: currentLocale,
    available: ['en', 'pt-br']
  });
  
  // If we have a saved language and it's different from current, update it
  if (savedLanguage && savedLanguage !== currentLocale && ['en', 'pt-br'].includes(savedLanguage)) {
    console.log('🔄 Restoring saved language:', savedLanguage);
    setLocale(savedLanguage as any);
  }
}
