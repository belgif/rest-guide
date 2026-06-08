# Agent guide for belgif/rest-guide

## Project Overview

The REST styleguide defines a set of rules and best practices for designing RESTful APIs. It is maintained in this repository as an AsciiDoc document, built with AsciidoctorJ and custom extensions. The styleguide is published as a standalone HTML document and bundled as a zip file for distribution.

## Build

This is a Maven multi-module project. Requires Java 17.

```bash
# Build everything (default goal is `package`)
mvn

# Build without packaging the zip
mvn compile
```

Output is generated to `guide/target/generated-docs/` (HTML) and bundled as a zip in `target/`.

There are no automated tests. The build either succeeds (valid AsciiDoc) or fails.

## Architecture

Two Maven modules:

- **`asciidoc-extensions/`** — Custom AsciidoctorJ block processor (`RuleBlock`) that adds a `[rule, <id>]` block to AsciiDoc. It assigns a stable HTML anchor (`rule-<id>`), a reftext (`[id]`), and styles the block as `exampleblock rule`. Registered via Java SPI in `META-INF/services/`.

- **`guide/`** — The AsciiDoc source for the REST styleguide. Entry point is `guide/src/main/asciidoc/index.adoc`, which `include::` assembles all chapter files. Three Asciidoctor executions are configured in the POM:
  1. Main guide (`index.adoc` → `generated-docs/`)
  2. Problem pages (`problems/` → `generated-docs/problems/`)
  3. Issue pages (`issues/` → `generated-docs/issues/`, with `preserveDirectories`)

## AsciiDoc Conventions

### Rules
Rules use the custom `[rule, <rule-id>]` block (registered by `asciidoc-extensions`):

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
Reference rules with `<<rule-<rule-id>>>` or `<<rule-<rule-id>, custom text>>`.

## Release Process

Before releasing, update `changelog.adoc` and the `:update-date:` attribute in `index.adoc`. Releases are triggered by pushing a git tag:

```bash
git tag -a v2025.06 -m "release v2025.06"
git push origin v2025.06
```

The `maven-release` GitHub Actions workflow picks up the tag, uses it as the version, and creates a draft GitHub release with the artifact attached.
