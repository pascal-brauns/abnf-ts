import { Key } from './Type';

export const map: Record<Key, RegExp> = {
  // trival
  WS: /^[ \t]+/,
  COMMENT: /^;[^\r\n]*/,
  CRLF: /^\r?\n/,

  // rule
  IDENT: /^[A-Za-z][A-Za-z0-9-]*/,
  EQUAL: /^=/,

  // alternation
  SLASH: /^\//,

  // repetition
  STAR: /^\*/,
  NUMBER: /^[0-9]+/,

  // group
  LPAREN: /^\(/,
  RPAREN: /^\)/,

  // option
  LBRACK: /^\[/,
  RBRACK: /^\]/,

  // literal num-val
  BINLIT: /^%b[0-1]+(?:[.-][0-1]+)*/,
  DECLIT: /^%d[0-9]+(?:[.-][0-9]+)*/,
  HEXLIT: /^%x[0-9A-Fa-f]+(?:[.-][0-9A-Fa-f]+)*/,

  // literal char-val
  STRING: /^"([^"\\]|\\.)*"/, // case insensitive (RFC 5234)
  ISTRING: /^%i"([^"\\]|\\.)*"/, // case insensitive (RFC 7405)
  SSTRING: /^%s"([^"\\]|\\.)*"/, // case sensitive (RFC 7405)

  // prose-val
  PROSE: /^<[\x20-\x3D\x3F-\x7E]*>/,
};

export const keys = <Key[]>Object.keys(map);