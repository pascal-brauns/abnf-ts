import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

export default class Ref implements Expression {
  public readonly type = Evaluation.Type.Component.REF;

  static parse: Parse<Ref> = (context) => {
    const name = context.cursor.consume('IDENT').toUpperCase();
    return new Ref(name);
  };

  constructor(public readonly name: string) { }

  evaluate: Evaluate = (cursor) => {
    const rule = cursor.state.context.rules[this.name];

    if (!rule) {
      return new Evaluation.Node({
        data: Evaluation.Node.failure(Evaluation.Type.Reason.REF_RULE_NOT_FOUND),
        cursor,
        expression: this.type,
        children: [],
      });
    }

    if (cursor.state.nameMap.get(cursor.state.index)?.has(rule.name)) {
      return new Evaluation.Node({
        data: Evaluation.Node.failure(Evaluation.Type.Reason.REF_RULE_CYCLIC_RECURSION),
        cursor,
        expression: this.type,
        children: [],
      })
    }

    const child = cursor.label(this.name);
    const evaluation = rule.expression.evaluate(child);

    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      return new Evaluation.Node({
        data: Evaluation.Node.failure(Evaluation.Type.Reason.REF_RULE_EVALUATION_FAILED),
        cursor: child,
        expression: this.type,
        children: [evaluation],
      });
    }

    return new Evaluation.Node({
      cursor: child,
      data: Evaluation.Node.success(evaluation.data.length),
      expression: this.type,
      children: [evaluation],
    });
  };

  flat() {
    return this;
  }
}