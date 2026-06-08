# Plan: Migrate REST Guide to Antora

## Problem statement

The guide is currently built as a single monolithic HTML page via the Asciidoctor Maven plugin. The goal is to replace this with an Antora-based multi-page site, one page per Level 1 section (`==`), using the Antora Maven plugin. The existing Asciidoctor build is removed entirely.

## Key challenges identified

1. **RuleBlock extension**: The `asciidoc-extensions` module is a Java AsciidoctorJ extension. Antora runs Node.js (`asciidoctor.js`), so the Java extension cannot be used. It must be rewritten as a JavaScript Antora extension.
2. **332 cross-references**: All `<<anchor>>` refs that cross page boundaries must become `xref:page.adoc#anchor[]`. Same-page refs can stay as-is.
3. **Heading levels**: Every chapter file uses `== Title` as its root heading. In Antora, each page must have `= Title` as the root. All headings must be promoted by one level.
4. **`ifdef::full-guide`**: Used in some problem pages to show extra content. With Antora, the attribute is set globally in the playbook, so all pages get full content.
5. **`asciidoctorj-diagram` and `spring-asciidoctor-extensions-block-switch`**: Both are in the POM but not actually used in the content. They can simply be dropped.

## Decisions

- **Sub-resource pages**: `resources-document.adoc`, `resources-collection.adoc`, `resources-controller.adoc` → separate Antora pages (not embedded includes).
- **Problems and issues**: Moved into the Antora site.
- **Build**: Replace Asciidoctor Maven plugin entirely; keep only Antora Maven plugin.
- **UI**: Use default Antora UI (custom CSS deferred).

---

## Todo list

### Phase 1 — Antora structure
- **antora-structure**: Create the Antora content directory layout under `guide/src/antora/` (`antora.yml`, `modules/ROOT/pages/`, `modules/ROOT/images/`)
- **antora-playbook**: Create `antora-playbook.yml` at project root with local content source, extension config, and AsciiDoc attributes

### Phase 2 — JavaScript RuleBlock extension
- **js-rule-extension**: Write `guide/src/antora/extensions/rule-block-extension.js` that replicates the Java `RuleBlock` processor behavior using the asciidoctor.js block extension API

### Phase 3 — Convert and move AsciiDoc sources
- **convert-chapters**: For each of the ~20 chapter `.adoc` files:
  - Move to `modules/ROOT/pages/`
  - Promote heading levels (`== X` → `= X`, `=== X` → `== X`, etc.)
  - Strip attributes already covered by antora.yml/playbook (`:stylesheet:`, `:idprefix:`, etc.)
  - Remove the `index.adoc` include-assembly file
- **convert-resources-sub**: `resources.adoc` includes three sub-files with `[leveloffset=+1]`. Convert the includes to nav links; each sub-file becomes its own page with promoted headings.
- **convert-problems-issues**: Move `problems/*.adoc` and `issues/**/*.adoc` into the pages directory. They already use `= Title` (standalone format); update internal `xref:` paths to Antora format.
- **nav-adoc**: Create `modules/ROOT/nav.adoc` listing all pages in the correct reading order

### Phase 4 — Cross-reference conversion
- **xref-mapping**: Build a map of every anchor ID to its page filename (scan all pages for `[[anchor]]`, `[#anchor]`, rule IDs, and section IDs)
- **xref-convert**: For each `<<anchor>>` or `<<anchor,text>>` reference, if the anchor is on a different page, replace with `xref:page.adoc#anchor[text]`; if same-page, leave as-is

### Phase 5 — Maven POM updates
- **pom-guide**: Replace `asciidoctor-maven-plugin` (with its 3 executions) in `guide/pom.xml` with the `antora-maven-plugin` (`org.antora:antora-maven-plugin:1.0.0-alpha.5`). Update assembly descriptor to package the Antora site output instead.
- **pom-parent**: Remove the `asciidoc-extensions` module from the parent POM (or keep it if there's a reason to retain the Java artifact)
- **pom-assembly**: Update or remove `guide/src/main/assembly/asciidoc-zip.xml` to reference Antora output directory

## Notes

- Antora output goes to `guide/target/site/` (Antora Maven plugin default when run within a project).
- The `antora.yml` component descriptor sets `full-guide: ''` so all conditional content is included.
- The `:API:` attribute (currently in `index.adoc`) moves to `antora.yml` or the playbook's `asciidoc.attributes`.
- The `asciidoc-extensions` Java module becomes obsolete once the JS extension is in place. It should be removed from the Maven build to avoid confusion.
- The `spring-asciidoctor-extensions-block-switch` and `asciidoctorj-diagram` dependencies in `guide/pom.xml` are unused and will be dropped with the POM replacement.
- Update `AGENTS.md` to reflect new build command and structure once migration is done.

## URL compatibility for problems/ and issues/ pages

The problems and issues pages are linked externally via stable URLs (e.g., `https://www.belgif.be/specification/rest/api-guide/problems/badRequest.html`). These URLs must continue to work.

In Antora, the published URL path is: `{site-url}/{component}/{version}/{page-path}.html`. With a versionless component, the version segment is omitted. Setting:
- `antora.yml`: `name: api-guide`, `version: ~`
- playbook `site.url`: `https://www.belgif.be/specification/rest`
- Pages at `modules/ROOT/pages/problems/badRequest.adoc` and `modules/ROOT/pages/issues/invalidInput.adoc`

…yields exactly `https://www.belgif.be/specification/rest/api-guide/problems/badRequest.html` — preserving all existing URLs.
