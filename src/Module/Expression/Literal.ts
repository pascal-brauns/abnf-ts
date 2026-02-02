import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

type Numval = (key: 'BINLIT' | 'DECLIT' | 'HEXLIT', radix: number) => Parse<Literal>;
type Charval = (key: 'STRING' | 'ISTRING' | 'SSTRING') => Parse<Literal>;

const isValidCharCode = (value: number) => (
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 0xFF
);

export default class Literal implements Expression {
  public readonly type = Evaluation.Type.Component.LITERAL;

  private static numval: Numval = (key, radix) => (context) => {
    const input = context.cursor.consume(key);

    // .substring(2) because '%b', '%B', '%d', '%D', '%x', '%X'
    const segments = input.substring(2).split('.');

    const charsets: Set<string>[] = [];
    for (const segment of segments) {
      const value = segment.split('-');
      const start = parseInt(value[0]!, radix);
      const end = value[1] ? parseInt(value[1], radix) : start;

      const charset = new Set<string>();
      for (let i = start; i <= end; i++) {
        if (!isValidCharCode(i)) {
          throw new RangeError('Invalid num-val range');
        }
        const character = String.fromCharCode(i);
        charset.add(character);
      }
      charsets.push(charset);
    }

    return new Literal(charsets);
  }

  static binval = Literal.numval('BINLIT', 2);
  static decval = Literal.numval('DECLIT', 10);
  static hexval = Literal.numval('HEXLIT', 16);

  private static charval: Charval = (key) => (context) => {
    const input = context.cursor.consume(key);
    const start = 1 + (key === 'STRING' ? 0 : 2);
    const end = input.length - 1;
    const value = input.substring(start, end);

    const charsets: Set<string>[] = [];
    for (const character of value) {
      const charset = new Set<string>();

      if (key === 'SSTRING') {
        charset.add(character);
      }
      else {
        charset.add(character.toLowerCase());
        charset.add(character.toUpperCase());
      }

      charsets.push(charset);
    }

    return new Literal(charsets);
  }

  static string = Literal.charval('STRING');
  static istring = Literal.charval('ISTRING');
  static sstring = Literal.charval('SSTRING');

  static of(pattern: string) {
    const characters = pattern.split('');
    const charsets = characters.map(character => new Set(character));
    return new Literal(charsets);
  }

  constructor(public readonly charsets: Set<string>[]) { }

  evaluate: Evaluate = (cursor) => {
    const value = cursor.peek(this.charsets.length);

    for (let i = 0; i < this.charsets.length; i++) {
      const charset = this.charsets[i] as Set<string | undefined>;
      const success = charset?.has(value[i]);
      if (!success) {
        return new Evaluation.Node({
          cursor,
          data: Evaluation.Node.failure(Evaluation.Type.Reason.LITERAL_CHARSET_MISMATCH),
          expression: this.type,
          children: [],
        });
      }
    }

    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.success(this.charsets.length),
      expression: this.type,
      children: [],
    });
  };

  flat() {
    return this;
  }
}