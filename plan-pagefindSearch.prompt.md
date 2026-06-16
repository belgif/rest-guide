# Plan: Replace Lunr with Pagefind Search

Replace `@antora/lunr-extension` with [pagefind](https://pagefind.app/), a static-site search library that indexes rendered HTML directly. Pagefind runs post-build as a CLI, creates a `pagefind/` index under `build/site/`, and provides its own UI widget. This also naturally fixes the rule-ID search problem since pagefind indexes raw HTML text (including the hidden `<span>` markers) without the Lunr English-stemmer limitation.

## Steps

1. **Update [`package.json`](package.json)** — replace `@antora/lunr-extension` devDependency with `pagefind`, and add `pagefind --site build/site` to the build script between the antora and generate-redirects steps.

2. **Update [`antora-playbook.yml`](antora-playbook.yml)** — remove the `@antora/lunr-extension` entry from `antora.extensions`; no `SITE_SEARCH_PROVIDER` env var needed anymore.

3. **Update [`header-content.hbs`](src/supplemental-ui/partials/header-content.hbs)** — replace the `{{#if env.SITE_SEARCH_PROVIDER}}` conditional block with an unconditional `<div id="search">` container that `PagefindUI` will populate, and add a `<script>` tag to initialize `new PagefindUI({ element: '#search', showImages: false })`.

4. **Update [`head-styles.hbs`](src/supplemental-ui/partials/head-styles.hbs)** — add a `<link>` for `/_/pagefind/pagefind-ui.css` and a `<script src="/_/pagefind/pagefind-ui.js">` (pagefind outputs these under `build/site/pagefind/`, served relative to the site root).

5. **Remove the hidden `<span>` workaround from [`rule-block-extension.js`](src/antora/extensions/rule-block-extension.js)** — revert to the simple `reader.readLines()` call since pagefind indexes raw HTML text and will pick up rule IDs from the anchor `id="rule-<ruleId>"` attribute and surrounding heading text natively.

## Further Considerations

1. **Pagefind UI path**: Pagefind generates its assets under `build/site/pagefind/`. In Antora's output the site root is `build/site/`, so the relative path from any page like `api-guide/resources-document.html` to the pagefind assets would be `../pagefind/`. The `{{{uiRootPath}}}` helper in Handlebars gives the relative path to `_/`, so a similar approach like `{{{siteRootPath}}}/pagefind/pagefind-ui.js` can be used, or simply hardcode the root-relative URL `/specification/rest/pagefind/pagefind-ui.js` using `{{{or site.url siteRootPath}}}`.

2. **Rule ID indexing without hidden spans**: Pagefind will index `id="rule-ctr-first"` attribute values on the block element, but attribute values are not indexed as text by pagefind — only text nodes are. The hidden `<span>` may still be needed if rule IDs are not visible as text content. The step 5 revert is optional — test first, keep span if rule IDs still don't surface in search.

3. **`data-pagefind-ignore` for nav/sidebar**: Pagefind by default indexes all body text including the sidebar nav. Adding `data-pagefind-body` to `<article class="doc">` in the layout would scope indexing to page content only — but this requires overriding the Antora UI bundle layout template (e.g., `layouts/default.hbs`) which is not currently in supplemental-ui. This can be added as a supplemental layout file override if needed.

