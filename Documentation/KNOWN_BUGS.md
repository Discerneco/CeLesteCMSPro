# Known Bugs and Issues

This document tracks known bugs, issues, and limitations in CeLesteCMS Pro that are pending resolution.

## UI Issues

### Dark Mode

1. **Language Switcher Button Styling**
   - **Description**: The language switcher button doesn't style properly in dark mode. Attempts to match it with the "Add Post" button styling have been unsuccessful.
   - **Affected Component**: `src/lib/components/LanguageSwitcher.svelte`
   - **Current Behavior**: The button uses a blue background in dark mode but doesn't match the overall UI design system.
   - **Expected Behavior**: Should have consistent styling with other UI elements in dark mode.
   - **Workaround**: None currently available.
   - **Priority**: Medium
   - **Date Added**: 2025-05-11

## Backend Issues

### Svelte 5 Runes Usage

1. **Runes Outside of Svelte Files**
   - **Description**: Svelte 5 runes (`$state`, `$derived`, etc.) can only be used in `.svelte` files or files with the `.svelte.js`/`.svelte.ts` extension.
   - **Affected Component**: Previously in `src/lib/stores/auth.ts`
   - **Current Behavior**: Using runes in regular `.ts` files causes the error `rune_outside_svelte`
   - **Solution**: Moved the auth store to `src/lib/stores/auth.svelte.ts` and updated imports
   - **Status**: Fixed in commit on 2025-05-12
   - **Note**: Remember to use `.svelte.ts` extension for any non-component files that need to use runes

*No other known backend issues at this time.*

## Performance Issues

*No known performance issues at this time.*

## Browser Compatibility

*No known browser compatibility issues at this time.*

---

## Resolved Issues

*This section will track issues that have been resolved, including the date and version of resolution.*
