# Agent guide for belgif/rest-guide

## Project Overview

The REST styleguide defines a set of rules and best practices for designing RESTful APIs. It is maintained in this repository as an AsciiDoc document, built with Antora and a custom extension. The styleguide is published as a multi-page Antora site and bundled as a zip file for distribution.

## Build

This is a Maven project. Requires Java 17.

```bash
# Build everything (default goal is `package`)
mvn

# Build without packaging the zip
mvn compile

# If Node.js is already installed locally, skip the download for faster builds:
mvn compile -Dnode.executable=node
```

Output is generated to `guide/target/site/` (Antora HTML site) and bundled as a zip in `target/`.

There are no automated tests. The build either succeeds (valid AsciiDoc) or fails.

## Architecture

One Maven module:

- **`guide/`** — The AsciiDoc source for the REST styleguide and the Antora build configuration. Built with `org.antora:antora-maven-plugin`.

### Antora source layout

```
guide/src/antora/
  antora.yml                          # Antora component descriptor (name: api-guide, version: ~)
  extensions/
    rule-block-extension.js           # Custom asciidoctor.js block processor for [rule, <id>]
  modules/ROOT/
    nav.adoc                          # Navigation tree
    pages/                            # One .adoc file per page
      *.adoc                          # Chapter pages (introduction, api, resources, …)
      problems/*.adoc                 # Standardized HTTP problem type pages
      issues/*.adoc                   # Input validation issue type pages
      issues/ext/*.adoc               # Extended issue type pages
    images/                           # Images referenced by pages
```

The Antora playbook is `antora-playbook.yml` at the repository root.

### URL structure

The Antora component is named `api-guide` with `version: ~` (versionless). Combined with `site.url: https://www.belgif.be/specification/rest` in the playbook, this produces stable URLs:
- Main guide pages: `https://www.belgif.be/specification/rest/api-guide/<page>.html`
- Problem pages: `https://www.belgif.be/specification/rest/api-guide/problems/<page>.html`
- Issue pages: `https://www.belgif.be/specification/rest/api-guide/issues/<page>.html`

## AsciiDoc Conventions

### Rules
Rules use the custom `[rule, <rule-id>]` block (processed by `rule-block-extension.js`):

```asciidoc
[rule, uri-notat]
.URI notation
====
**Path segments** SHOULD use **lowerCamelCase**. Trailing slashes MUST NOT be used.
====
```

- `rule-id` is a shorthand identifier, max 10 characters, dashes as word separators
- This generates anchor `#rule-<rule-id>` and cross-reference text `[rule-id]`
- When renaming a `rule-id`, keep the old anchor working by adding `[[rule-<old-id>]]` inline at the start of the rule body

### Examples
```asciidoc
.example title
====
<example content, may contain nested code blocks>
====
```

### RFC 2119 Keywords
Use **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, **OPTIONAL** in rule text per RFC 2119.

### Cross-references
- Same-page: `<<rule-<rule-id>>>` or `<<rule-<rule-id>, custom text>>`
- Cross-page: `xref:page.adoc#anchor[text]` — the page path is relative to `modules/ROOT/pages/`

### Page headings
Each page starts with `= Title` (level 0). Sections use `==`, `===`, etc. within a page.

## Release Process

Before releasing, update `changelog.adoc`. Releases are triggered by pushing a git tag:

```bash
git tag -a v2025.06 -m "release v2025.06"
git push origin v2025.06
```

The `maven-release` GitHub Actions workflow picks up the tag, uses it as the version, and creates a draft GitHub release with the artifact attached.

