# Plan: Hash-preserving redirect from old single-page to new multi-page site

The old site was a single `index.html` with all anchors (e.g. `#collection`, `#pagination`). The new Antora site splits content across multiple pages. Antora already generates a simple `index.html` that redirects to `introduction.html`, but it ignores the URL hash. The fix is a post-build Node.js script that replaces that `index.html` with a smarter one containing a JavaScript anchor-to-page lookup table.

## Steps

1. **Create [`scripts/generate-redirects.js`](scripts/generate-redirects.js)** — a Node.js post-build script that:
   - Scans all `.html` files in `build/site/api-guide/` recursively using `fs` and `path`
   - For each file, extracts all element IDs via regex (`/\bid="([^"]+)"/g`)
   - Builds a `{ anchorId → relative-page-url }` map (e.g. `"collections-consult": "resources-collection.html"`)
   - Merges in a small hardcoded table for old *chapter-level* anchors that are now page titles and have no `id` attribute in the new HTML (e.g. `"rest-api"→"api.html"`, `"collection"→"resources-collection.html"`, `"json-2"→"json.html"`, `"http-methods"→"methods.html"`, etc., plus all 13 problem type top-level anchors like `"bad-request"→"problems/badRequest.html"`)
   - Writes a new `build/site/api-guide/index.html` containing the map as an inline JS object and a redirect function that reads `location.hash`, looks up the anchor, and calls `location.replace()` with the target page (keeping `#anchor` when the target page actually contains that anchor, dropping it for page-level mappings)

2. **Update [`package.json`](package.json)** — chain the script: `"build": "antora antora-playbook.yml && node scripts/generate-redirects.js"` so it runs every time after Antora regenerates the site.

3. **Verify the hardcoded overrides cover all old chapter-level anchors** by cross-referencing the old TOC anchors in [`temp/guide/target/generated-docs/index.html`](temp/guide/target/generated-docs/index.html) (lines ~696–835) against the new page filenames — specifically the anchors that are now page `<h1>` titles with no `id`.

4. **Add the `scripts/` directory to source control** and document the redirect generation in `README.md` or `AGENTS.md`.

## Further Considerations

1. **Anchor collision**: if two new pages share the same element ID, the script should prefer the page where the anchor appears higher in the document structure (or log a warning). Should duplicates be detected and flagged, or silently last-write-wins?
2. **Issue/ext pages**: the `issues/ext/` sub-pages (`anyOfExpected`, etc.) may not have had old single-page anchors at all — confirm whether the old `index.html` included these extended issues or if they are entirely new content that needs no redirect.
3. **Deployment context**: the redirect only helps if the old `index.html` URL is still being served. Confirm that `https://www.belgif.be/specification/rest/api-guide/index.html` is the actual old public URL people have bookmarked, or whether a different base path was used.
