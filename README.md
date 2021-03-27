# REST guide

The REST styleguide, built from these sources, is available on https://www.gcloud.belgium.be/rest/.

This styleguide is established by the REST design working group, which includes various participating Belgian government institutions.
See the [wiki](https://github.com/belgif/rest-guide/wiki) for more information on the organization of the REST design working group and its meeting reports .

# Reusable OpenAPI schemas

Reusable OpenAPI 2.0 and 3.0 data types are maintained in the [belgif openapi-* GitHub repositories](https://github.com/belgif?q=openapi&type=&language=), organized per domain.
Types in beta status are in the source code, but not part of the released artifacts. Apache Maven users can also [download them from Maven Central](https://search.maven.org/search?q=g:io.github.belgif.openapi).

| domain | link |
|--------|------|
| common | [latest release](https://github.com/belgif/openapi-common/releases/latest) |
| problem | [latest release](https://github.com/belgif/openapi-problem/releases/latest) |
| time | [latest release](https://github.com/belgif/openapi-time/releases/latest) |
| person | [latest release](https://github.com/belgif/openapi-person/releases/latest) |
| person-identifier | [latest release](https://github.com/belgif/openapi-person-identifier/releases/latest) |
| location | [latest release](https://github.com/belgif/openapi-location/releases/latest) |
| organization-identifier | [latest release](https://github.com/belgif/openapi-organization-identifier/releases/latest) |
| employment-identifier | [latest release](https://github.com/belgif/openapi-employment-identifier/releases/latest) |
| money | [repository (not yet released)](https://github.com/belgif/openapi-money) |

# Guidelines to write the styleguide

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in the REST styleguide are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).
They are used in the rules defined throughout the REST styleguide wherever possible.

Examples must follow the following format:

```
.example title
====
<example, may use nested code blocks>
====
```

Rules must follow the following format:

```
[.rule, caption="Rule {counter:rule-number}: "]
.rule title
====
<the rule, using RFC 2119 key words>
====
```

# Building the styleguide

The styleguide is built with [Apache Maven](https://maven.apache.org).

With Maven installed, run `mvn site` in the root directory of the project. 
The styleguide will be built in the `target/site/doc/` directory.

