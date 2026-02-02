import * as Source from '@/Source';
import * as Evaluation from '@/Evaluation';

import { ParseContext } from './Type';
import Alternation from './Alternation';
import Concatenation from './Concatenation';
import Repetition from './Repetition';
import * as Element from './Element';

type Expression = Evaluation.Type.Expression;

export const trivial: Source.Type.Key[] = ['WS', 'COMMENT', 'CRLF'];

export const extend = (cursor: Source.Cursor, expression: Expression) => {
  cursor.consume('SLASH');
  cursor.skip(trivial);

  const expressions: Expression[] = [];
  
  if (Alternation.guard(expression)) {
    expressions.push(...expression.expressions);
  }
  else {
    expressions.push(expression);
  }

  expressions.push(parse(cursor));

  return new Alternation(expressions);
}

export const parse = (cursor: Source.Cursor, depth = 0) => {
  const hierarchy = [Alternation, Concatenation, Repetition, Element];
  const component = hierarchy.at(depth) ?? Element;

  const context: ParseContext = {
    cursor,
    parse: cursor => parse(cursor, (depth + 1) % hierarchy.length).flat()
  };

  return component.parse(context);
};