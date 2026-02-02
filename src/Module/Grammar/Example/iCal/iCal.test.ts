import ics from './iCal.json';

import * as Evaluation from '@/Evaluation';
import Grammar from '@/Grammar';

const rfc3629 = Grammar.core.extend('lenient', `
UTF8-octets = *( UTF8-char )
UTF8-char   = UTF8-1 / UTF8-2 / UTF8-3 / UTF8-4
UTF8-1      = %x00-7F
UTF8-2      = %xC2-DF UTF8-tail
UTF8-3      = %xE0 %xA0-BF UTF8-tail / %xE1-EC 2( UTF8-tail ) /
              %xED %x80-9F UTF8-tail / %xEE-EF 2( UTF8-tail )
UTF8-4      = %xF0 %x90-BF 2( UTF8-tail ) / %xF1-F3 3( UTF8-tail ) /
              %xF4 %x80-8F 2( UTF8-tail )
UTF8-tail   = %x80-BF
`);

const ical = rfc3629.extend('lenient', `
contentline   = name *(";" param ) ":" value CRLF
; This ABNF is just a general definition for an initial parsing
; of the content line into its property name, parameter list,
; and value string

; When parsing a content line, folded lines MUST first
; be unfolded according to the unfolding procedure
; described above.  When generating a content line, lines
; longer than 75 octets SHOULD be folded according to
; the folding procedure described above.

name          = iana-token / x-name

iana-token    = 1*(ALPHA / DIGIT / "-")
; iCalendar identifier registered with IANA

x-name        = "X-" [vendorid "-"] 1*(ALPHA / DIGIT / "-")
; Reserved for experimental use.

vendorid      = 3*(ALPHA / DIGIT)
; Vendor identification

param         = param-name "=" param-value *("," param-value)
; Each property defines the specific ABNF for the parameters
; allowed on the property.  Refer to specific properties for
; precise parameter ABNF.

param-name    = iana-token / x-name

param-value   = paramtext / quoted-string

paramtext     = *SAFE-CHAR

value         = *VALUE-CHAR

quoted-string = DQUOTE *QSAFE-CHAR DQUOTE

QSAFE-CHAR    = WSP / %x21 / %x23-7E / NON-US-ASCII
; Any character except CONTROL and DQUOTE

SAFE-CHAR     = WSP / %x21 / %x23-2B / %x2D-39 / %x3C-7E
              / NON-US-ASCII
; Any character except CONTROL, DQUOTE, ";", ":", ","

VALUE-CHAR    = WSP / %x21-7E / NON-US-ASCII
; Any textual character

NON-US-ASCII  = UTF8-2 / UTF8-3 / UTF8-4
; UTF8-2, UTF8-3, and UTF8-4 are defined in [RFC3629]

CONTROL       = %x00-08 / %x0A-1F / %x7F
; All the controls except HTAB
`);

const grammar = ical.extend('strict', `
VALUE-CHAR =/ %s"ä" / %s"Ä" / %s"ü" / %s"Ü" / %s"ö" / %s"Ö" / %s"ß"\r\n
`);

type Name = 'contentline' | 'name' | 'value' | 'param' | 'param-name' | 'param-value';

describe('ContentLine', () => {
  test('should successfully parse holiday.json', () => {
    for (const line of ics.flat()) {
      const rule = grammar.rule('contentline');
      const graph = rule.graph(line.input);

      const name = graph.find({ type: 'REF', name: 'name' })?.text();
      expect(name).toBe(line.output.name);

      const value = graph.find({ type: 'REF', name: 'value' })?.text();
      expect(value).toBe(line.output.value);

      const params = graph.filter({ type: 'REF', name: 'param' });

      for (let i = 0; i < params.length; i++) {
        const param = params[i];

        if (param === undefined) {
          fail('param should not be undefined');
        }

        const graph = new Evaluation.Graph<Name>(param);

        const name = graph.find({ type: 'REF', name: 'param-name' })?.text();
        expect(name).toBe(line.output.params[i]?.name);

        const value = graph.find({ type: 'REF', name: 'param-value' })?.text();
        expect(value).toBe(line.output.params[i]?.value);
      }
    }
  });
});