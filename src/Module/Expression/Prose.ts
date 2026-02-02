import * as Evaluation from '@/Evaluation';
import { Parse } from "./Type";

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

export default class Prose implements Expression {
  public readonly type = Evaluation.Type.Component.PROSE;

  static parse: Parse<Prose> = ({ cursor }) => {
    const prose = cursor.consume('PROSE');
    const text = prose.substring(1, prose.length - 1);
    return new Prose(text);
  }

  constructor(public readonly text: string) { }

  evaluate: Evaluate = (cursor) => {
    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.failure(Evaluation.Type.Reason.PROSE_NOT_EVALUABLE),
      expression: this.type,
      children: [],
    });
  }

  flat() {
    return this;
  }
}