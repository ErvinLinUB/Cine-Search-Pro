# Cine-Search Pro

**Test #1 - GUI Programming**

**Checkpoint 1:**

- **Requirements fullfilled:**
    - **Req 1: Debounce** - `setTimeout`/`clearTimeout` manually implemented, fires only after 300ms of no typing, no library used.
    - **Req 1: Abort Pattern** - `AbortController` cancels in-flight requests, `AbortError` is caught and ignored silently.
    - **Req 3: Fragment Pattern** - `<template>` cloned into a `DocumentFragment`, only ONE `appendChild` to the real DOM at the end.
    - **Req 4: Result Caching** - `Map` stores results by query, cache is checked before every fetch so repeated searches produce zero network requests.
    - **Req 5: State-Based CSS** - `data-loading` attribute toggled by JS only, CSS will handle the visual.

- **Requirements yet to be fillfilled:**
    - **Req 2: Promise.allSettled** - movie detail panel not built yet, no concurrent fetching of Details, Credits, and Videos.
    - **Req 5: Keyboard Navigation** - no ArrowUp, ArrowDown, Enter handling yet.
    - **Req 5: Highlighting** - search term is not wrapped in `<span class="highlight">` yet.
    - **Req 6: XSS Hardening** - can't be fulfilled until highlighting is built, since that's where the vulnerability lives.

*- Ervin Lin*