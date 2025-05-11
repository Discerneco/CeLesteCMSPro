// inlang.config.js
import { defineConfig } from "@inlang/sdk"

export default defineConfig({
  sourceLanguageTag: "en",
  languageTags: ["en", "pt-br"],
  modules: [
    // Plugin for message extraction
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-json@latest/dist/index.js",
    // SvelteKit integration
    "https://cdn.jsdelivr.net/npm/@inlang/sdk-js-adapter@latest/dist/index.js"
  ],
  // Where to store message files
  pathPattern: "./src/lib/i18n/messages/{languageTag}.json"
})
