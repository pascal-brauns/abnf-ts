import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

/**
 * __Variable Repetition:  *Rule__
   
   
   The operator "*" preceding an element indicates repetition.  The full
   form is:

         <a>*<b>element

   where <a> and <b> are optional decimal values, indicating at least
   <a> and at most <b> occurrences of the element.

   Default values are 0 and infinity so that *<element> allows any
   number, including zero; 1*<element> requires at least one;
   3*3<element> allows exactly 3; and 1*2<element> allows one or two.

 * __Specific Repetition:  nRule__
   

   A rule of the form:

         <n>element

   is equivalent to

         <n>*<n>element

   That is, exactly <n> occurrences of <element>.  Thus, 2DIGIT is a
   2-digit number, and 3ALPHA is a string of three alphabetic
   characters.
 */
export default class Repetition implements Expression {
  public readonly type = Evaluation.Type.Component.REPETITION;
  static parse: Parse<Repetition> = (context) => {
    context.cursor.skip(['WS']);
    const tokens = context.cursor.take(3, { skip: ['WS'] });

    const condition = {
      'n*m': tokens[0]?.key === 'NUMBER' && tokens[1]?.key === 'STAR' && tokens[2]?.key === 'NUMBER',
      'n*': tokens[0]?.key === 'NUMBER' && tokens[1]?.key === 'STAR' && tokens[2]?.key !== 'NUMBER',
      'n': tokens[0]?.key === 'NUMBER' && tokens[1]?.key !== 'STAR',
      '*m': tokens[0]?.key === 'STAR' && tokens[1]?.key === 'NUMBER',
      '*': tokens[0]?.key === 'STAR' && tokens[1]?.key !== 'NUMBER',
    }

    let min;
    if (condition['n*m'] || condition['n*'] || condition['n']) {
      min = parseInt(context.cursor.consume('NUMBER'), 10);
      context.cursor.skip(['WS']);
    }
    else if (condition['*m'] || condition['*']) {
      min = 0;
    }
    else {
      min = 1;
    }

    if (condition['n*m'] || condition['n*'] || condition['*'] || condition['*m']) {
      context.cursor.consume('STAR');
      context.cursor.skip(['WS']);
    }

    let max;
    if (condition['n*m'] || condition['*m']) {
      max = parseInt(context.cursor.consume('NUMBER'), 10);
    }
    else if (condition['n*'] || condition['*']) {
      max = Infinity;
    }
    else if (condition['n']) {
      max = min;
    }
    else {
      max = 1;
    }

    const expression = context.parse(context.cursor);
    return new Repetition(expression, min, max);
  };

  constructor(
    public readonly expression: Expression,
    public readonly min: number,
    public readonly max: number
  ) { };

  evaluate: Evaluate = (cursor) => {
    let count = 0;

    const failures: Evaluation.Node<Evaluation.Type.Result.FAILURE>[] = [];
    const successes: Evaluation.Node<Evaluation.Type.Result.SUCCESS>[] = [];

    while (count < this.max) {
      const length = successes.reduce((length, node) => length + node.data.length, 0);
      const index = cursor.state.index + length;
      const before = index;
      const evaluation = this.expression.evaluate(cursor.at(index));
      if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
        failures.push(evaluation);
        break;
      }

      const after = before + evaluation.data.length;
      const progress = after > before;

      if (!progress && count < this.min) {
        return new Evaluation.Node({
          cursor,
          data: Evaluation.Node.failure(Evaluation.Type.Reason.REPETITION_NO_PROGRESS),
          expression: this.type,
          children: failures,
        });
      }

      successes.push(evaluation);

      if (!progress && count >= this.min) {
        break;
      }

      if (evaluation.data.length === 0) {
        break;
      }

      count++;
    }

    if (count < this.min) {
      return new Evaluation.Node({
        cursor,
        data: Evaluation.Node.failure(Evaluation.Type.Reason.REPETITION_LENGTH_BELOW_MINIMUM),
        expression: this.type,
        children: failures,
      });
    }


    const success = new Evaluation.Node({
      cursor,
      data: Evaluation.Node.success(successes.reduce((length, success) => length + success.data.length, 0)),
      expression: this.type,
      children: successes,
    });

    return success;
  };

  flat() {
    if (this.min === 1 && this.max === 1) {
      return this.expression;
    }
    return this;
  }
};