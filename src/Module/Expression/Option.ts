import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

/**
 * Square brackets enclose an optional element sequence:

         [foo bar]

   is equivalent to

         *1(foo bar).
 */
export default class Option implements Expression {
  public readonly type = Evaluation.Type.Component.OPTION;

  static parse: Parse<Option> = (context) => {
    context.cursor.consume('LBRACK');
    const expression = context.parse(context.cursor);
    context.cursor.consume('RBRACK');
    return new Option(expression);
  };

  constructor(public readonly expression: Expression) { }

  evaluate: Evaluate = (cursor) => {
    const evaluation = this.expression.evaluate(cursor);
    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.success(evaluation.data.type === Evaluation.Type.Result.SUCCESS ? evaluation.data.length : 0),
      expression: this.type,
      children: [evaluation],
    });
  };

  flat() {
    return this;
  }
};