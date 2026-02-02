import * as Evaluation from '@/Evaluation';
import * as Expression from '@/Expression';
import * as Source from '@/Source';

export default class Rule<T extends string = string> implements Evaluation.Type.Rule {

  static parse(rules: Record<string, Rule>, cursor: Source.Cursor) {
    const name = cursor.consume('IDENT').toUpperCase();
    cursor.skip(Expression.trivial);
    cursor.consume('EQUAL');

    const rule = rules[name] ?? null;

    const expression =
      (rule
        ? Expression.extend(cursor, rule.expression)
        : Expression.parse(cursor)) as Evaluation.Type.Expression

    cursor.skip(Expression.trivial);
    return new Rule(rules, name, expression);
  }

  constructor(
    public readonly rules: Record<string, Evaluation.Type.Rule>,
    public readonly name: string,
    public readonly expression: Evaluation.Type.Expression
  ) { }

  evaluate(input: string) {
    const context = new Evaluation.Context(input, this.rules);
    const cursor = Evaluation.Cursor.init(this.name, context);
    return this.expression.evaluate(cursor);
  }

  graph(input: string) {
    const node = this.evaluate(input);
    return new Evaluation.Graph<T>(node);
  }
}