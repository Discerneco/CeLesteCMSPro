# Known Bugs and Issues

This document tracks known bugs, issues, and limitations in CeLesteCMS Pro that are pending resolution.

## UI Issues

### Login Page (DaisyUI Version)

1. **Input Field Styling**
   - **Description**: The input fields in the login page are lighter than in the design template and don't blend well with the dark theme.
   - **Affected Component**: `src/routes/admin/login2/+page.svelte`
   - **Current Behavior**: Input fields have a more opaque background and defined borders.
   - **Expected Behavior**: Should have semi-transparent backgrounds with subtle borders that blend better with the dark theme.
   - **Workaround**: None currently available.
   - **Priority**: Low
   - **Date Added**: 2025-05-18

2. **Button Color Consistency**
   - **Description**: The "Log in" button color doesn't match the specific purple shade in the design template.
   - **Affected Component**: `src/routes/admin/login2/+page.svelte`
   - **Current Behavior**: Using DaisyUI's default primary color for the button.
   - **Expected Behavior**: Should match the exact purple shade from the design template.
   - **Workaround**: None currently available.
   - **Priority**: Low
   - **Date Added**: 2025-05-18

3. **Logo Background**
   - **Description**: The logo requires a transparent background to blend properly with the card.
   - **Affected Component**: `static/logo.png` and related image files
   - **Current Behavior**: Logo has a visible background in dark mode.
   - **Expected Behavior**: Logo should have a transparent background.
   - **Workaround**: None currently available.
   - **Priority**: Medium
   - **Date Added**: 2025-05-18

4. **Typography Inconsistencies**
   - **Description**: Typography spacing and styling in the login page doesn't perfectly match the design template.
   - **Affected Component**: `src/routes/admin/login2/+page.svelte`
   - **Current Behavior**: Font sizes, spacing, and weights have slight differences from the template.
   - **Expected Behavior**: Typography should match the design template exactly.
   - **Workaround**: None currently available.
   - **Priority**: Low
   - **Date Added**: 2025-05-18

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

*No other known backend issues at this time.*

## Performance Issues

*No known performance issues at this time.*

## Browser Compatibility

*No known browser compatibility issues at this time.*

---

## Resolved Issues

*This section will track issues that have been resolved, including the date and version of resolution.*
