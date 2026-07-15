# Plan: Pagefind Search Results Navigate Directly to Rule Anchors

Make pagefind search results for content inside rule blocks link directly to the rule's own anchor (`page.html#rule-<ruleId>`) instead of landing on the page without a fragment.

## Background

Pagefind's `calculate_sub_results` function creates per-anchor sub-results using only **heading elements** (`h1`–`h6`):

```javascript
const anchors = fragment.anchors.filter(
  (a) => /h\d/i.test(a.element) && a.text?.length && /\S/.test(a.text)
)
```

Rule blocks are currently rendered as `<div id="rule-<ruleId>" class="openblock exampleblock rule">`. Because the anchor lives on a `<div>`, pagefind ignores it when building sub-results. Search results therefore link to the nearest preceding section heading, not to the rule itself.

## Solution

In the asciidoctor.js postprocessor (already registered in `rule-block-extension.js`), apply a single combined regex transformation to each rule block's HTML:

1. **Remove `id` from the outer wrapper `<div>`** — the id is no longer needed there once it moves to the heading.
2. **Change `<div class="title">` → `<h6 id="rule-<ruleId>" class="title" data-pagefind-weight="10">`** (and `</div>` → `</h6>`).

This makes pagefind's indexer record the rule title as an `h6` anchor, so sub-results (and primary results within a rule) link to `page.html#rule-<ruleId>`.

## Steps

### 1. Update `src/antora/extensions/rule-block-extension.js`

Replace the existing postprocessor that only adds `data-pagefind-weight` with a single, combined replacement:

```javascript
registry.postprocessor(function () {
  const self = this
  self.process(function (document, output) {
    return output.replace(
      /<div id="(rule-[^"]+)" class="openblock exampleblock rule">\n<div class="title">([^\n]*)<\/div>/g,
      (match, ruleId, titleContent) =>
        `<div class="openblock exampleblock rule">\n<h6 id="${ruleId}" class="title" data-pagefind-weight="10">${titleContent}</h6>`
    )
  })
})
```

The regex matches:
- `<div id="rule-…" class="openblock exampleblock rule">` — the outer wrapper (id captured)
- `\n<div class="title">…</div>` — the title div (content captured, assumed single line)

The replacement:
- Outer div loses its `id`
- Title element becomes `<h6 id="rule-…" class="title" data-pagefind-weight="10">…</h6>`

### 2. Update `tests/rule-block.test.js`

Replace the existing test assertions with:

```javascript
test('Rule block title is rendered as h6 with the rule id and data-pagefind-weight', async () => {
  const html = fs.readFileSync(...)
  expect(html).toContain('<h6 id="rule-col-name" class="title" data-pagefind-weight="10">')
})

test('Rule block outer div no longer carries the rule id', async () => {
  const html = fs.readFileSync(...)
  expect(html).not.toContain('<div id="rule-col-name"')
})
```

### 3. (Optional) Adjust `src/supplemental-ui/css/rule.css`

If the Antora UI bundle's stylesheet applies default heading margins to `h6` that cause unexpected spacing in the rule title, add:

```css
.rule.exampleblock>.title {
    margin: 0;
}
```

The existing font/color rules in `rule.css` already override `font-weight`, `font-style`, `font-size`, and `color`, so only margin/padding may need adjustment.

## Why This Works End-to-End

| Concern | Outcome |
|---|---|
| Pagefind sub-result anchor | `<h6 id="rule-col-name">` satisfies `/h\d/i.test(a.element)` → sub-result URL includes `#rule-col-name` |
| Existing anchor links (`href="#rule-col-name"`) | Still resolve — the `id` now lives on the `<h6>` |
| Redirect map script (`generate-redirects.js`) | Scans all `id` attrs in article HTML via regex → still finds `rule-col-name` on the `<h6>` |
| CSS `.rule.exampleblock>.title` | `<h6 class="title">` is still a direct child of `.rule.exampleblock` → rules apply unchanged |
| No hidden content | `rule-search-keyword` span is gone; `data-pagefind-weight` is on visible text |
| Pagefind weight boost | Title text (including `[ruleId]` link text) is ranked higher in search results |

## Further Considerations

1. **Regex fragility**: The pattern `class="openblock exampleblock rule"` relies on asciidoctor's fixed class ordering. If asciidoctor ever changes the order, the regex silently stops matching. Consider an alternative that uses `id="rule-` as the only stable anchor.

2. **Multi-line title content**: The regex uses `[^\n]*` for title content, assuming the title renders on a single line. Asciidoctor's open block title is always inline text, so this holds — but if a title ever contains a raw HTML passthrough with a newline the regex would miss it.

3. **h6 in document outline**: Rule titles become `<h6>` headings, which appear in the document outline (e.g., browser reader mode, assistive technologies). This is semantically reasonable (rules are subsections) but worth reviewing if the pages have many deeply nested real headings already at level 5.

4. **CSS margin on h6**: Browser user-agent stylesheets add a small top/bottom margin to heading elements. The Antora UI bundle may or may not reset this. Verify visually after rebuild and add `margin: 0` to `rule.css` if needed.

