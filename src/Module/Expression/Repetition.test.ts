import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Repetition from './Repetition';

describe('Repetition.parse()', () => {
  test('should parse a repetition with a minimum and maximum count', () => {

    const expression = Mock.expression([
      () => fail('Repetition.parse() should not call context.parse()'),
    ]);

    const repetition = Repetition.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'NUMBER', length: 1 },
          { index: 2, key: 'STAR', length: 1 },
          { index: 3, key: 'NUMBER', length: 1 },
          { index: 4, key: 'SSTRING', length: 5 },
        ],
        input: ' 5*5%s"A"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        expect(text).toBe('%s"A"');
        return expression;
      },
    });

    expect(repetition.min).toBe(5);
    expect(repetition.max).toBe(5);
    expect(repetition.expression).toBe(expression);
  });

  test('should parse a repetition with only a minimum count', () => {

    const expression = Mock.expression([
      () => fail('Repetition.parse() should not call context.parse()'),
    ]);

    const repetition = Repetition.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'NUMBER', length: 1 },
          { index: 2, key: 'STAR', length: 1 },
          { index: 3, key: 'SSTRING', length: 5 },
        ],
        input: ' 5*%s"A"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        expect(text).toBe('%s"A"');
        return expression;
      },
    });

    expect(repetition.min).toBe(5);
    expect(repetition.max).toBe(Infinity);
    expect(repetition.expression).toBe(expression);
  });

  test('should parse a repetition with only a maximum count', () => {
    const expression = Mock.expression([
      () => fail('Repetition.parse() should not call context.parse()'),
    ]);

    const repetition = Repetition.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'STAR', length: 1 },
          { index: 2, key: 'NUMBER', length: 1 },
          { index: 3, key: 'SSTRING', length: 5 },
        ],
        input: ' *5%s"A"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        expect(text).toBe('%s"A"');
        return expression;
      },
    });

    expect(repetition.min).toBe(0);
    expect(repetition.max).toBe(5);
    expect(repetition.expression).toBe(expression);
  });

  test('should parse a repetition without any explicit count', () => {
    const expression = Mock.expression([
      () => fail('Repetition.parse() should not call context.parse()'),
    ]);

    const repetition = Repetition.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'SSTRING', length: 5 },
        ],
        input: ' %s"A"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        expect(text).toBe('%s"A"');
        return expression;
      },
    });

    expect(repetition.min).toBe(1);
    expect(repetition.max).toBe(1);
    expect(repetition.expression).toBe(expression);
  });

  test('should parse a repetition with an exact count', () => {
    const expression = Mock.expression([
      () => fail('Repetition.parse() should not call context.parse()'),
    ]);

    const repetition = Repetition.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'WS', length: 1 },
          { index: 1, key: 'NUMBER', length: 1 },
          { index: 2, key: 'SSTRING', length: 5 },
        ],
        input: ' 3%s"A"',
      }),
      parse: cursor => {
        const text = cursor.consume('SSTRING');
        expect(text).toBe('%s"A"');
        return expression;
      },
    });

    expect(repetition.min).toBe(3);
    expect(repetition.max).toBe(3);
    expect(repetition.expression).toBe(expression);
  });
});

describe('Repetition.evaluate()', () => {
  test('succeeds when the child expression evaluates successfully within the repetition range', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = (index: number) => Mock.cursor(context).at(index);
    const successes = [
      Mock.success({ length: 1, cursor: cursor(0) }),
      Mock.success({ length: 1, cursor: cursor(1) }),
    ] as const;
    const failure = Mock.failure(cursor(2));
    const expression = Mock.expression([
      () => successes[0],
      () => successes[1],
      () => failure
    ]);
    const min = 1;
    const max = 3;
    const repetition = new Repetition(expression, min, max);
    const evaluation = repetition.evaluate(cursor(0));    
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REPETITION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(2);
      expect(evaluation.children).toEqual(successes);
    }
  });

  test('succeeds when the repetition stops evaluation successfully when the maximum of evaluations is reached', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = (index: number) => Mock.cursor(context).at(index);

    const successes = [
      Mock.success({ length: 1, cursor: cursor(0) }),
      Mock.success({ length: 1, cursor: cursor(1) }),
      Mock.success({ length: 1, cursor: cursor(2) }),
      Mock.success({ length: 1, cursor: cursor(3) }),
      Mock.success({ length: 1, cursor: cursor(4) }),
    ] as const;
    const failure = Mock.failure(cursor(5));
    const expression = Mock.expression([
      () => successes[0],
      () => successes[1],
      () => successes[2],
      () => successes[3],
      () => successes[4],
      () => failure
    ]);

    const min = 1;
    const max = 3;
    const repetition = new Repetition(expression, min, max);
    const evaluation = repetition.evaluate(cursor(0));
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REPETITION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([successes[0], successes[1], successes[2]]);
    }
  });

  test('fails when the child expression does not evaluate successfully as many times as the repetition minimum', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = (index: number) => Mock.cursor(context).at(index);

    const success = Mock.success({ length: 1, cursor: cursor(0) });
    const failure = Mock.failure(cursor(1));
    const expression: Evaluation.Type.Expression = Mock.expression([
      () => success,
      () => failure,
    ]);

    const min = 2;
    const max = 3;
    const repetition = new Repetition(expression, min, max);
    const evaluation = repetition.evaluate(cursor(0));
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REPETITION);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.REPETITION_LENGTH_BELOW_MINIMUM);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.children).toEqual([failure]);
    }
  });

  test('fails when the child expression evaluates to a success with no length', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ length: 0, cursor });
    const expression = Mock.expression([() => success]);

    const min = 1;
    const max = 3;
    const repetition = new Repetition(expression, min, max);
    const evaluation = repetition.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REPETITION);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.REPETITION_NO_PROGRESS);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.children).toEqual([]);
    }
  });
});

describe('Repetition.flat()', () => {
  test('returns the nested expression when min === 1 && max === 1', () => {
    const expression = Mock.expression([() => fail('Repetition.flat() should never call expression.evaluate()')]);
    const repetition = new Repetition(expression, 1, 1);
    const result = repetition.flat();
    expect(result).toBe(expression);
  });

  test('returns the repetition itself when min === 0 || max === 0', () => {
    const expression = Mock.expression([() => fail('Repetition.flat() should never call expression.evaluate()')]);
    const repetition = new Repetition(expression, 0, 1);
    const result = repetition.flat();
    expect(result).toBe(repetition);
  });
});