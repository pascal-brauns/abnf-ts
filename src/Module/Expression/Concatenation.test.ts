import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Concatenation from './Concatenation';

describe('Concatenation.parse()', () => {
  test('should parse a concatenation that consists of two literals that span over two lines', () => {
    let calls = 0;
    const literals = ['%s"ABC"', '%s"XYZ"'];

    const concatenation = Concatenation.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'SSTRING', length: 7 },
          { index: 8, key: 'CRLF', length: 2 },
          { index: 10, key: 'WS', length: 1 },
          { index: 11, key: 'SSTRING', length: 7 },
          { index: 18, key: 'CRLF', length: 2 },
        ],
        input: ' %s"ABC"\r\n %s"XYZ"\r\n'
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        const literal = literals[calls];
        calls++;
        expect(text).toBe(literal);
        return Mock.expression([
          () => fail('Concatenation.parse() should never evaluate any expression')
        ]);
      },
    });

    expect(concatenation.expressions.length).toBe(2);
  });

  test('should return a concatenation with no expressions when there are only trivial tokens in the cursor', () => {
    const concatenation = Concatenation.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'CRLF', length: 2 },
          { index: 3, key: 'WS', length: 1 },
        ],
        input: ' \r\n '
      }),
      parse: () => fail('Concatenation.parse() should never call context.parse() when there are only trivial tokens in the cursor'),
    });

    expect(concatenation.expressions.length).toBe(0);
  });

  test('should parse a nested concatenation within parentheses ', () => {
    const concatenation = Concatenation.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 1, key: 'SSTRING', length: 7 },
          { index: 8, key: 'RPAREN', length: 1 },
          { index: 9, key: 'WS', length: 1 },
          { index: 10, key: 'SSTRING', length: 5 }
        ],
        input: '(%s"ABC") %s"XYZ"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        const literal = '%s"ABC"';
        expect(text).toBe(literal);
        return Mock.expression([
          () => fail('Concatenation.parse() should never evaluate any expression')
        ]);
      },
    });

    expect(concatenation.expressions.length).toBe(1);
  });
});

describe('Concatenation.evaluate()', () => {
  test('succeeds when all child expression evaluations are successes', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = (index: number) => Mock.cursor(context).at(index);
    const successes = [
      Mock.success({ cursor: cursor(0), length: 1 }),
      Mock.success({ cursor: cursor(1), length: 1 })
    ];
    const expressions = successes.map(evaluation => Mock.expression([() => evaluation]));
    const concatenation = new Concatenation(expressions);
    const evaluation = concatenation.evaluate(cursor(0));
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.CONCATENATION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(2);
      expect(evaluation.children).toEqual(successes);
    }
  });

  test('fails when at least one of the child expression evaluatiuons is a failure', () => {
    const context = new Evaluation.Context('xbc', {});
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ cursor });
    const failure = Mock.failure(cursor);
    const expressions = [success, failure].map(evaluation => Mock.expression([() => evaluation]));
    const concatenation = new Concatenation(expressions);
    const evaluation = concatenation.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.CONCATENATION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.CONCATENATION_INVALID_SEQUENCE);
      expect(evaluation.children).toEqual([failure]);
    }
  });
});

describe('Concatenation.flat()', () => {
  test('returns the concatenation itself when expressions.length !== 0', () => {
    const alternation = new Concatenation([
      Mock.expression([() => fail('Concatenation.flat() should never call expression.evaluate()')]),
      Mock.expression([() => fail('Concatenation.flat() should never call expression.evaluate()')]),
    ]);
    const result = alternation.flat();
    expect(result).toBe(alternation);
  });

  test('returns the child expression at index 0 when expressions.length === 1', () => {
    const expression = Mock.expression([
      () => fail('Concatenation.flat() should never call expression.evaluate()')
    ]);
    const concatenation = new Concatenation([expression]);
    const result = concatenation.flat();
    expect(result).toBe(expression);
  });
});