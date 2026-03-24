# Cine-Search Pro

**Test #1 - GUI Programming**

**Checkpoint 1:**

- **Requirements fullfilled:**
    - **1: Debounce** - `setTimeout`/`clearTimeout` manually implemented, fires only after 300ms of no typing, no library used.
    - **1: Abort Pattern** - `AbortController` cancels in-flight requests, `AbortError` is caught and ignored silently.
    - **3: Fragment Pattern** - `<template>` cloned into a `DocumentFragment`, only ONE `appendChild` to the real DOM at the end.
    - **4: Result Caching** - `Map` stores results by query, cache is checked before every fetch so repeated searches produce zero network requests.
    - **5: State-Based CSS** - `data-loading` attribute toggled by JS only, CSS will handle the visual.

- **Requirements yet to be fillfilled:**
    - **2: Promise.allSettled** - movie detail panel not built yet, no concurrent fetching of Details, Credits, and Videos.
    - **5: Keyboard Navigation** - no ArrowUp, ArrowDown, Enter handling yet.
    - **5: Highlighting** - search term is not wrapped in `<span class="highlight">` yet.
    - **6: XSS Hardening** - can't be fulfilled until highlighting is built, since that's where the vulnerability lives.

**Final Changes:**

- **Requirements fulfilled:**
    - **2: Promise.allSettled** - Movie detail panel fetches Details, Credits, and Videos simultaneously. Partial failure degrades gracefully, the other panels still render correctly.
    - **5: Keyboard Navigation** - ArrowUp, ArrowDown, and Enter navigate and select results.
    - **5: Highlighting** - Matching search text is wrapped in `<span class="highlight">` dynamically with a yellow background.
    - **6: XSS Hardening** - Highlighting is built using the DOM API exclusively via `buildHighlightedTitle()`. `textContent` is used throughout, never `innerHTML` with unsanitised input.

*- Ervin Lin*