# abnf-ts

A type-safe, performant and easy to use ABNF (Augmented Backus-Naur Form) engine.

## Installation

```bash
npm install abnf-ts
```

## Features

- compilation of ABNF for higher level grammar evaluation
- type inference of ABNF grammar rule names with TypeScript
- cyclic reference detection
- graph based syntax evaluation
- detailed diagnostics about parsing results
- validated against real RFC grammars (ABNF, URL, iCalendar)

## Basic Usage

```ts
import Grammar from 'abnf-ts';

// core grammar included and easy to extend: ALPHA, BIT, CHAR, ...
const grammar = Grammar.core.extend("lenient", `
SAY-MY-NAME = PREFIX HYPHEN SUFFIX
PREFIX = 4 (ALPHA)
HYPHEN = "-"
SUFFIX = 2 (ALPHA)
`);

// pick a rule to evaluate
const rule = grammar.rule('SAY-MY-NAME');

// get a navigable syntax graph for the input "abnf-ts"
const graph = rule.graph("abnf-ts");

// find a syntax node of type "REF" whose name is "SAY-MY-NAME"
const node = graph.find({ type: "REF", name: "SAY-MY-NAME" });

// grab the text to which the syntax node evaluates to
const text = node?.text();

// prints { myName: "abnf-ts" }
console.log({ myName: text });

// get more fine grained results from the graph
const prefix = graph.find({ type: "REF", path: ["SAY-MY-NAME", "PREFIX"] });
const suffix = graph.find({ type: "REF", name: "SUFFIX" });

// prints { prefix: "abnf", suffix: "ts" }
console.log({ prefix: prefix?.text(), suffix: suffix?.text() });

```

## API Reference

### `Grammar`

The `Grammar` class can be used to define grammars in ABNF (Augmented Backus-Naur Form). 

#### `Grammar.compile(mode: 'lenient' | 'strict', abnf: string): Grammar` *(static)*

Compiles a new ABNF `Grammar` instance from scratch.

##### Lenient mode

ABNF code MUST NOT contain any carriage return characters to delimit rules:

```ts

const grammar = Grammar.compile('lenient', `
MY-RULE = %s"say my name"
`);

```


##### Strict mode

ABNF code MUST contain carriage return characters to delimit rules:

```ts

const grammar = Grammar.compile('strict', `
MY-RULE = %s"say my name"\r
`);

```

#### `Grammar.rule(name: string): Grammar.Rule`

Returns a `Rule` instance by it's name. The rule should be a part of the grammar.

```ts

const grammar = Grammar.compile('lenient', `
MY-RULE = %s"say my name"
`);

const rule = grammar.rule('MY-RULE');

```

#### `Grammar.extend(mode: 'lenient' | 'strict', extension: string): Grammar`

Returns a new instance of `Grammar` which is copy that can be extended with new rules using the `extension` parameter.

```ts

const base = Grammar.compile('lenient', `
BASE-RULE = %s"say my name"
`);

const extension = base.extend('lenient', `
EXTENSION-RULE = BASE-RULE %s"twice"
`);

```

#### `Grammar.core` *(static)*

`Grammar.core` is a set of ABNF core rules which are defined in [RFC 5234](https://datatracker.ietf.org/doc/html/rfc5234) itself.

These rules are commonly used across many popular RFC documents.

`Grammar.core` can be used as a base grammar to define new grammars that depend on it.

```ts

const grammar = Grammar.core.extend('lenient', `
THREE-ALPHAS = 3 (ALPHA)
`);

```

See the definition of `Grammar.core` below:

```ts

Grammar.core = Grammar.compile('lenient', `
ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z

BIT            =  "0" / "1"

CHAR           =  %x01-7F
                       ; any 7-bit US-ASCII character,
                       ;  excluding NUL

CR             =  %x0D
                       ; carriage return

CRLF           =  CR LF
                       ; Internet standard newline

CTL            =  %x00-1F / %x7F
                       ; controls

DIGIT          =  %x30-39
                       ; 0-9

DQUOTE         =  %x22
                       ; " (Double Quote)

HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"

HTAB           =  %x09
                       ; horizontal tab

LF             =  %x0A
                       ; linefeed

LWSP           =  *(WSP / CRLF WSP)
                       ; Use of this linear-white-space rule
                       ;  permits lines containing only white
                       ;  space that are no longer legal in
                       ;  mail headers and have caused
                       ;  interoperability problems in other
                       ;  contexts.
                       ; Do not use when defining mail
                       ;  headers and use with caution in
                       ;  other contexts.

OCTET          =  %x00-FF
                       ; 8 bits of data

SP             =  %x20

VCHAR          =  %x21-7E
                       ; visible (printing) characters

WSP            =  SP / HTAB
                       ; white space
`);
```

### `Rule`

The `Rule` class repesents a specific rule which was extracted from a `Grammar` instance.

#### `Rule.graph(input: string): Graph`

`Rule.graph()` allows to compute a syntax graph for a given input. The graph is being computed according to the grammar rule.

```ts

const grammar = Grammar.core.extend('lenient', `
MY-RULE = 3 (ALPHA)
`);

const rule = grammar.rule('MY-RULE');

const graph = rule.graph('ABC');

```

### Graph

The `Graph` class represents a syntax evaluation graph for a given input. It can be used to obtain specific information about the parsed input.

#### `Graph.find(): Node | null`

`Graph.find()` allows to find exactly one specific evaluation node within the syntax graph.

```ts

import Grammar from 'abnf-ts';

// core grammar included and easy to extend: ALPHA, BIT, CHAR, ...
const grammar = Grammar.core.extend("lenient", `
SAY-MY-NAME = PREFIX HYPHEN SUFFIX
PREFIX = 4 (ALPHA)
HYPHEN = "-"
SUFFIX = 2 (ALPHA)
`);

// pick a rule to evaluate
const rule = grammar.rule('SAY-MY-NAME');

// get a navigable syntax graph for the input "abnf-ts"
const graph = rule.graph("abnf-ts");

// find a syntax node of type "REF" whose name is "PREFIX"
const node = graph.find({ type: "REF", name: "PREFIX" });

// grab the text to which the syntax node evaluates to
const prefix = node?.text();

// prints { prefix: "abnf" }
console.log({ prefix: prefix?.text() });

```

#### `Graph.filter(): Node[]`

`Graph.filter()` allows to find all evaluation nodes within the syntax graph that match the specified criteria.

```ts

import Grammar from 'abnf-ts';

// core grammar included and easy to extend: ALPHA, BIT, CHAR, ...
const grammar = Grammar.core.extend("lenient", `
SAY-MY-NAME = PREFIX HYPHEN SUFFIX
PREFIX = 4 (ALPHA)
HYPHEN = "-"
SUFFIX = 2 (ALPHA)
`);

// pick a rule to evaluate
const rule = grammar.rule('SAY-MY-NAME');

// get a navigable syntax graph for the input "abnf-ts"
const graph = rule.graph("abnf-ts");

// find all syntax nodes of type "REF" whose name is "ALPHA"
const nodes = graph.filter({ type: "REF", name: "ALPHA" });

// grab the texts to which the syntax nodes evaluate to
const alphas = nodes.map(node => node.text());

// prints { alphas: ["a", "b", "n", "f", "t", "s"] }
console.log({ alphas });

```