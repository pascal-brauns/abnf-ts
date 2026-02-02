import Literal from './Literal';
import Ref from './Ref';
import Group from './Group';
import Option from './Option';
import Prose from './Prose';

import { ParseContext } from './Type';

export const parse = (context: ParseContext) => {
  context.cursor.skip(['WS', 'COMMENT']);
  const [token] = context.cursor.take();
  if (!token) {
    throw new SyntaxError('Unexpected EOF');
  }
  switch (token.key) {
    case 'BINLIT': return Literal.binval(context);
    case 'DECLIT': return Literal.decval(context);
    case 'HEXLIT': return Literal.hexval(context);
    case 'STRING': return Literal.string(context);
    case 'ISTRING': return Literal.istring(context);
    case 'SSTRING': return Literal.sstring(context);
    case 'IDENT': return Ref.parse(context);
    case 'LPAREN': return Group.parse(context);
    case 'LBRACK': return Option.parse(context);
    case 'PROSE': return Prose.parse(context);
    default: throw new SyntaxError(`Unsupported token type ${token.key}`);
  }
};