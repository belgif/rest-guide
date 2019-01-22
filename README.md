This REST styleguide is established by the REST design working group, which includes various participating Belgian government institutions.

The styleguide, built from these sources, is publicly available on https://www.gcloud.belgium.be/rest/.
An [automatic build](http://gcloud-rest-styleguide-website.test.ext.ssbcloud.be/rest/) triggered on commit is also available.

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

The styleguide is built with [https://maven.apache.org](Apache Maven).

With Maven installed, run `mvn site` in the root directory of the project. 
The styleguide will be built in the `target/site/doc/` directory.

