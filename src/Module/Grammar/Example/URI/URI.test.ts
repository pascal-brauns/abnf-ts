import uri from './URI.json';

import * as Evaluation from '@/Evaluation';
import Grammar from '@/Grammar';

export const grammar = Grammar.core.extend('lenient', `
URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

hier-part     = "//" authority path-abempty
              / path-absolute
              / path-rootless
              / path-empty

URI-reference = URI / relative-ref

absolute-URI  = scheme ":" hier-part [ "?" query ]

relative-ref  = relative-part [ "?" query ] [ "#" fragment ]

relative-part = "//" authority path-abempty
              / path-absolute
              / path-noscheme
              / path-empty

scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

authority     = [ userinfo "@" ] host [ ":" port ]
userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
host          = IP-literal / IPv4address / reg-name
port          = *DIGIT

IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

IPv6address   =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

h16           = 1*4HEXDIG
ls32          = ( h16 ":" h16 ) / IPv4address
IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet

dec-octet     = DIGIT                 ; 0-9
              / %x31-39 DIGIT         ; 10-99
              / "1" 2DIGIT            ; 100-199
              / "2" %x30-34 DIGIT     ; 200-249
              / "25" %x30-35          ; 250-255

reg-name      = *( unreserved / pct-encoded / sub-delims )

path          = path-abempty    ; begins with "/" or is empty
              / path-absolute   ; begins with "/" but not "//"
              / path-noscheme   ; begins with a non-colon segment
              / path-rootless   ; begins with a segment
              / path-empty      ; zero characters

path-abempty  = *( "/" segment )
path-absolute = "/" [ segment-nz *( "/" segment ) ]
path-noscheme = segment-nz-nc *( "/" segment )
path-rootless = segment-nz *( "/" segment )
path-empty    = 0<pchar>

segment       = *pchar
segment-nz    = 1*pchar
segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
              ; non-zero-length segment without any colon ":"

pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

query         = *( pchar / "/" / "?" )

fragment      = *( pchar / "/" / "?" )

pct-encoded   = "%" HEXDIG HEXDIG

unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
reserved      = gen-delims / sub-delims
gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="
`);

describe('URI grammar', () => {
  test('parses uri successfully', () => {
    const rule = grammar.rule('URI');
    expect(rule.name).toBe('URI');

    const graph = rule.graph(uri);
    expect(graph.root.data.type).toBe(Evaluation.Type.Result.SUCCESS);
    if (graph.root.data.type === Evaluation.Type.Result.SUCCESS) {
      // const scheme = graph.find({ path: ['URI', 'scheme'] });
      const scheme = graph.find({ type: 'REF', name: 'scheme' })?.text();
      expect(scheme).toBe('http');

      // const host = graph.find({ path: ['URI', 'hier-part', 'authority', 'host'] });
      const host = graph.find({ type: 'REF', name: 'host' });
      expect(host?.text()).toBe('www.example.com');

      // const port = graph.find({ path: ['URI', 'hier-part', 'authority', 'port'] });
      const port = graph.find({ type: 'REF', name: 'port' });
      expect(port?.text()).toBe('8080');

      // const path = graph.find({ path: ['URI', 'hier-part', 'path-abempty'] });
      const path = graph.find({ type: 'REF', name: 'path-abempty' });
      expect(path?.text()).toBe('/foo/bar');

      // const query = graph.find({ path: ['URI', 'query'] });
      const query = graph.find({ type: 'REF', name: 'query' });
      expect(query?.text()).toBe('bar=baz&baz=foo');

      // const fragment = graph.find({ path: ['URI', 'fragment'] });
      const fragment = graph.find({ type: 'REF', name: 'fragment' });
      expect(fragment?.text()).toBe('fragment');
    }
  })
});