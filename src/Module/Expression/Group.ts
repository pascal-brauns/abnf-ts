import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

/**
 * Elements enclosed in parentheses are treated as a single element,
   whose contents are strictly ordered.  Thus,

         elem (foo / bar) blat

   matches (elem foo blat) or (elem bar blat), and

         elem foo / bar blat

   matches (elem foo) or (bar blat).

   NOTE:

      It is strongly advised that grouping notation be used, rather than
      relying on the proper reading of "bare" alternations, when
      alternatives consist of multiple rule names or literals.

   Hence, it is recommended that the following form be used:

        (elem foo) / (bar blat)

   It will avoid misinterpretation by casual readers.

   The sequence group notation is also used within free text to set off
   an element sequence from the prose.
 */
export default class Group implements Expression {
  public readonly type = Evaluation.Type.Component.GROUP;

  static parse: Parse<Group> = (context) => {
    context.cursor.consume('LPAREN');
    const expression = context.parse(context.cursor);
    context.cursor.consume('RPAREN');
    return new Group(expression);
  };

  constructor(public readonly expression: Expression) { }

  evaluate: Evaluate = (cursor) => {
    const evaluation = this.expression.evaluate(cursor);

    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      return new Evaluation.Node({
        cursor,
        data: Evaluation.Node.failure(Evaluation.Type.Reason.GROUP_EXPRESSION_FAILED),
        expression: this.type,
        children: [evaluation],
      });
    }

    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.success(evaluation.data.length),
      expression: this.type,
      children: [evaluation],
    });
  };

  flat() {
    return this;
  }
}