import * as Evaluation from '@/Evaluation';
import { Parse } from './Type';

type Expression = Evaluation.Type.Expression;
type Evaluate = Evaluation.Type.Evaluate;

/**
 * A rule can define a simple, ordered string of values (i.e., a
   concatenation of contiguous characters) by listing a sequence of rule
   names.  For example:

         foo         =  %x61           ; a

         bar         =  %x62           ; b

         mumble      =  foo bar foo

   So that the rule <mumble> matches the lowercase string "aba".

   Linear white space: Concatenation is at the core of the ABNF parsing
   model.  A string of contiguous characters (values) is parsed
   according to the rules defined in ABNF.  For Internet specifications,
   there is some history of permitting linear white space (space and
   horizontal tab) to be freely and implicitly interspersed around major
   constructs, such as delimiting special characters or atomic strings.

   NOTE:

      This specification for ABNF does not provide for implicit
      specification of linear white space.

   Any grammar that wishes to permit linear white space around
   delimiters or string segments must specify it explicitly.  It is
   often useful to provide for such white space in "core" rules that are
   then used variously among higher-level rules.  The "core" rules might
   be formed into a lexical analyzer or simply be part of the main
   ruleset.
 */
export default class Concatenation implements Expression {
  public readonly type = Evaluation.Type.Component.CONCATENATION;

  static parse: Parse<Concatenation> = (context) => {
    const expressions: Expression[] = [];

    while (true) {
      context.cursor.skip(['WS', 'COMMENT']);

      const [current, next] = context.cursor.take(2);
      if (!current) {
        break;
      }

      if (current.key === 'CRLF' && next?.key === 'WS') {
        context.cursor.consume('CRLF');
        context.cursor.consume('WS');
        continue;
      }

      if (current.key === 'CRLF' && next?.key !== 'WS') {
        break;
      }

      if (['SLASH', 'RPAREN', 'RBRACK'].includes(current.key)) {
        break;
      }

      expressions.push(context.parse(context.cursor));
    }

    return new Concatenation(expressions);
  };

  constructor(public readonly expressions: Expression[]) { }

  evaluate: Evaluate = (cursor) => {
    const successes: Evaluation.Node<Evaluation.Type.Result.SUCCESS>[] = [];

    for (const expression of this.expressions) {
      const length = successes.reduce((length, node) => length + node.data.length, 0);
      const index = cursor.state.index + length;

      const evaluation = expression.evaluate(cursor.at(index));
      if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
        return new Evaluation.Node({
          cursor,
          data: Evaluation.Node.failure(Evaluation.Type.Reason.CONCATENATION_INVALID_SEQUENCE),
          expression: this.type,
          children: [evaluation]
        });
      }
      successes.push(evaluation);
    }

    return new Evaluation.Node({
      cursor,
      data: Evaluation.Node.success(successes.reduce((length, node) => length + node.data.length, 0)),
      expression: this.type,
      children: successes
    });
  };

  flat(): Expression {
    if (this.expressions[0] && this.expressions.length === 1) {
      return this.expressions[0];
    }
    return this;
  }
};