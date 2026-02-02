import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Group from './Group';

describe('Group.parse()', () => {
  test('parses an expression within parentheses', () => {
    const group = Group.parse({
      cursor: new Source.Cursor({
        tokens: [
          { index: 0, key: 'LPAREN', length: 1 },
          { index: 1, key: 'IDENT', length: 9 },
          { index: 10, key: 'RPAREN', length: 1 },
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

    expect(group.expression.type).toBe(Evaluation.Type.Component.MOCK);
  });
});

describe('Group.evaluate()', () => {
  test('succeeds when the grouped expression succeeds', () => {
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ cursor, length: 3 });
    const expression = Mock.expression([() => success]);
    const group = new Group(expression);
    const evaluation = group.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.GROUP);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([success]);
    }
  });

  test('fails when the grouped expression fails', () => {
    const context = new Evaluation.Context('xbc', {});
    const cursor = Mock.cursor(context).at(0);
    const failure = Mock.failure(cursor);
    const expression = Mock.expression([() => failure]);
    const group = new Group(expression);
    const evaluation = group.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.GROUP);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.GROUP_EXPRESSION_FAILED);
      expect(evaluation.children).toEqual([failure]);
    }
  });
});

describe('Group.flat()', () => {
  test('returns the group itself', () => {
    const expression = Mock.expression([
      () => fail('Group.flat() should never call expression.evaluate()')
    ]);
    const group = new Group(expression);
    const result = group.flat();
    expect(result).toBe(group);
  });
});