type Alpha =
  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' |
  'v' | 'w' | 'x' | 'y' | 'z' |

  "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type Hyphen = '-'

type CR = '\r';
type LF = '\n';

type CRLF = `${CR}${LF}`;

type Trim<T extends string, P extends string> = (
  T extends `${P}${infer R}`
  ? Trim<R, P>
  : T extends `${infer R}${P}`
  ? Trim<R, P>
  : T
);

type WSP = ' ' | '\t';

type Element<T extends unknown[]> = T[number];

type Characters<T extends string> = Exclude<Element<Split<T, ''>>, ''>;

type Name<T extends string> = (
  T extends `${infer Left}=${string}`
  ? Trim<Left, WSP> extends infer K extends string
  ? Characters<K> extends (Alpha | Digit | Hyphen)
  ? K
  : never
  : never
  : never
);

type Identifiers<
  T extends string,
  I extends string[] = Split<T, CRLF>,
  O extends string[] = []
> =
  I extends [infer L extends string, ...infer R extends string[]]
  ? Name<L> extends infer K extends string
  ? Identifiers<T, R, [...O, K]>
  : Identifiers<T, R, O>
  : O;

export type Identifier<T extends string> = (
  Element<Identifiers<T>> extends never
  ? string
  : Element<Identifiers<T>>
);

type Split<
  T extends string,
  Delimiter extends string,
  List extends string[] = []
> = (
    T extends `${infer Before}${Delimiter}${infer After}`
    ? Split<After, Delimiter, [...List, Before]>
    : [...List, T]
  );

type Join<
  T extends string[],
  Delimiter extends string,
  Collector extends string = ''
> = (
    T extends [infer Value extends string, ...infer R extends string[]]
    ? Join<
      R,
      Delimiter,
      Collector extends ''
      ? Value
      : `${Collector}${Delimiter}${Value}`
    >
    : Collector
  );

export type Replace<
  T extends string,
  P extends string,
  R extends string
> = (
  Join<Split<T, P>, R>
);

export type Mode = 'strict' | 'lenient';

export type Input<T extends string, M extends Mode> = (
  M extends 'lenient'
  ? Replace<T, '\n', '\r\n'>
  : T
);