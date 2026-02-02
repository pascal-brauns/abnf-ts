import * as Source from '@/Source';
import * as Expression from '@/Expression';
import Rule from './Rule';
import * as Type from './Type';
import * as ABNF from './ABNF';

export default class Grammar<T extends string> {
  rules: Record<string, Rule<T>> = {};

  static core = Grammar.compile('lenient', ABNF.core);

  static compile<T extends string, M extends Type.Mode>(
    mode: M,
    input: T
  ): Grammar<Type.Identifier<Type.Input<T, M>>> {

    const code = mode === 'lenient'
      ? input.split('\n').join('\r\n') as Type.Replace<T, '\n', '\r\n'>
      : input

    return new Grammar(code);
  }

  private constructor(public readonly input: string) {
    const cursor = Source.Cursor.of(input.trimStart());
    while (cursor.open()) {
      const rule = Rule.parse(this.rules, cursor);
      this.rules[rule.name] = rule;
      cursor.skip(Expression.trivial);
    }
  }

  extend<E extends string, M extends Type.Mode>(mode: M, extension: E): Grammar<T | Type.Identifier<Type.Input<E, M>>> {
    const input = this.input + (mode === 'lenient'
      ? extension.split('\n').join('\r\n') as Type.Replace<T, '\n', '\r\n'>
      : extension);

    return new Grammar<T | Type.Identifier<Type.Input<E, M>>>(input);
  }

  rule(name: T) {
    const rule = this.rules[name.toUpperCase()];
    if (!rule) {
      throw new Error('Rule not found.');
    }
    return rule;
  }
}