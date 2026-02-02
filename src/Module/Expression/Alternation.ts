import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

/**
 * Elements separated by a forward slash ("/") are alternatives.
   Therefore,

         foo / bar

   will accept <foo> or <bar>.

   NOTE:

      A quoted string containing alphabetic characters is a special form
      for specifying alternative characters and is interpreted as a non-
      terminal representing the set of combinatorial strings with the
      contained characters, in the specified order but with any mixture
      of upper- and lowercase.
 */
export default class Alternation implements Expression {
  public readonly type = Evaluation.Type.Component.ALTERNATION;

  public static guard(expression: Expression): expression is Alternation {
    return expression.type === Evaluation.Type.Component.ALTERNATION;
  }

  public static parse: Parse<Alternation> = (context) => {
    const expressions: Expression[] = [];

    expressions.push(context.parse(context.cursor));

    while (true) {
      context.cursor.skip(['WS', 'COMMENT']);

      const [token] = context.cursor.take();

      if (token?.key !== 'SLASH') {
        break;
      }

      context.cursor.consume('SLASH');
      context.cursor.skip(['WS', 'COMMENT']);
      expressions.push(context.parse(context.cursor));
    }

    return new Alternation(expressions);
  };

  constructor(public readonly expressions: Expression[]) { }

  evaluate: Evaluate = (cursor) => {
    const nodes: Evaluation.Node[] = [];
    for (const expression of this.expressions) {
      const node = expression.evaluate(cursor);

      if (node.data.type === 'failure') {
        nodes.push(node);
        continue;
      }

      return new Evaluation.Node({
        cursor,
        expression: this.type,
        data: Evaluation.Node.success(node.data.length),
        children: [node],
      });
    }

    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.failure(Evaluation.Type.Reason.ALTERNATION_NO_MATCH),
      expression: this.type,
      children: nodes,
    });
  };

  flat(): Expression {
    if (this.expressions[0] && this.expressions.length === 1) {
      return this.expressions[0];
    }
    return this;
  }
};