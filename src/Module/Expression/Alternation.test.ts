import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Alternation from './Alternation';

describe('Alternation.guard()', () => {
  test('returns true when expression.type === Evaluation.Type.Component.ALTERNATION', () => {
    const result = Alternation.guard({
      type: Evaluation.Type.Component.ALTERNATION,
      evaluate: () => fail('Alternation.guard() should never call expression.evaluate()'),
      flat() {
        return this;
      }
    });

    expect(result).toBe(true);
  });

  test('returns false when expression.type !== Evaluation.Type.Component.ALTERNATION', () => {
    const result = Alternation.guard({
      type: Evaluation.Type.Component.MOCK,
      evaluate: () => fail('Alternation.guard() should never call expression.evaluate()'),
      flat() {
        return this;
      }
    });

    expect(result).toBe(false);
  });
})

describe('Alternation.parse()', () => {
  test('parses multiple expressions separated with a "/" as an alternation', () => {
    const alternation = Alternation.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'IDENT', length: 8 },
          { index: 8, key: 'WS', length: 1 },
          { index: 9, key: 'SLASH', length: 1 },
          { index: 10, key: 'IDENT', length: 8 },
          { index: 18, key: 'CRLF', length: 2 }
        ],
        input: 'rule-one / rule-two\r\n',
      }),
      parse: cursor => {
        cursor.consume('IDENT');
        return Mock.expression([
          () => fail('expression.evaluate() should not be parsed during parsing')
        ]);
      }
    });

    expect(alternation.expressions.length).toBe(2);
  });
});

describe('Alternation.evaluate()', () => {
  test('succeeds when at least on child expression evaluation is a success', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ cursor, length: 3 });
    const failure = Mock.failure(cursor);
    const expressions = [failure, success].map(evaluation => Mock.expression([() => evaluation]));
    const alternation = new Alternation(expressions);
    const evaluation = alternation.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.ALTERNATION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([success]);
    }
  });

  test('fails when none of the child expression evaluatiuons is a success', () => {
    const context = new Evaluation.Context('xbx', {});
    const cursor = Mock.cursor(context).at(0);
    const failures = [Mock.failure(cursor), Mock.failure(cursor)];
    const expressions = failures.map(evaluation => Mock.expression([() => evaluation]));
    const alternation = new Alternation(expressions);
    const evaluation = alternation.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.ALTERNATION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.ALTERNATION_NO_MATCH);
      expect(evaluation.children).toEqual(failures);
    }
  });
});

describe('Alternation.flat()', () => {
  test('returns the alternation itself when expressions.length !== 0', () => {
    const alternation = new Alternation([
      Mock.expression([() => fail('Alternation.flat() should never call expression.evaluate()')]),
      Mock.expression([() => fail('Alternation.flat() should never call expression.evaluate()')]),
    ]);
    const result = alternation.flat();
    expect(result).toBe(alternation);
  });

  test('returns the child expression at index 0 when expressions.length === 1', () => {
    const expression = Mock.expression([
      () => fail('Alternation.flat() should never call expression.evaluate()')
    ]);
    const alternation = new Alternation([expression]);
    const result = alternation.flat();
    expect(result).toBe(expression);
  });
});