import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Option from './Option';

describe('Option.parse()', () => {
  test('parses an expression within brackets', () => {
    const option = Option.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'LBRACK', length: 1 },
          { index: 1, key: 'IDENT', length: 9 },
          { index: 10, key: 'RBRACK', length: 1 },
        ],
        input: '[rule-name]',
      }),
      parse: cursor => {
        const name = cursor.consume('IDENT');
        expect(name).toBe('rule-name');
        return Mock.expression([
          () => fail('expression.evaluate() should not be called during parsing')
        ]);
      }
    });

    expect(option.expression.type).toBe(Evaluation.Type.Component.MOCK);
  });
});

describe('Option.evaluate()', () => {
  test('succeeds when the optional expression succeeds', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ cursor, length: 3 });
    const expression = Mock.expression([() => success]);
    const option = new Option(expression);
    const evaluation = option.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.OPTION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([success]);
    }
  });

  test('succeeds when the optional expression fails', () => {
    const context = new Evaluation.Context('xbc', {});
    const cursor = Mock.cursor(context).at(0);
    const failure = Mock.failure(cursor);
    const expression = Mock.expression([() => failure]);
    const option = new Option(expression);
    const evaluation = option.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.OPTION);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(0);
      expect(evaluation.children).toEqual([failure]);
    }
  });
});

describe('Option.flat()', () => {
  test('returns the option itself', () => {
    const expression = Mock.expression([
      () => fail('Option.flat() should never call expression.evaluate()')
    ]);
    const option = new Option(expression);
    const result = option.flat();
    expect(result).toBe(option);
  });
});