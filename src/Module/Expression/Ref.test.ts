import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Ref from './Ref';

describe('Ref.parse()', () => {
  test('always parses rule names as upper case', () => {
    const ref = Ref.parse({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'IDENT', length: 9 }],
        input: 'rule-name'
      }),
      parse: () => fail('Ref.parse() should never call context.parse()'),
    });

    expect(ref.name).toBe('RULE-NAME');
  });
});

describe('Ref.evaluate()', () => {
  test('fails when the referenced rule is not present in the context', () => {
    const ref = new Ref('rule-name');
    const context = new Evaluation.Context('abc', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = ref.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REF);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.REF_RULE_NOT_FOUND);
      expect(evaluation.children).toEqual([]);
    }
  });

  // test('fails wgen the referenced rule is cyclclic', () => {
  //   const rule = Mock.rule('rule-name', () => success);
  //   const rules = { 'rule-name': rule };
  //   const context = new Evaluation.Context('abc', rules);
  //   const cursor = Mock.cursor(context);
  //   const success = Mock.success({ cursor });

  //   const ref = new Ref('rule-name');

  //   const names = cursor.state.active.get(cursor.state.index);
  //   names?.add('rule-name');

  //   const evaluation = ref.evaluate(cursor);

  //   if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
  //     expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.REF_RULE_CYCLIC_RECURSION);
  //   }
  // });

  test('fails when the referenced rule expression evaluation is a failure', () => {
    const rule = Mock.rule('rule-name', () => failure);
    const rules = { 'rule-name': rule };
    const context = new Evaluation.Context('abc', rules);
    const cursor = Mock.cursor(context).at(0);
    const failure = Mock.failure(cursor);

    const ref = new Ref('rule-name');
    const evaluation = ref.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REF);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.REF_RULE_EVALUATION_FAILED);
      expect(evaluation.children).toEqual([failure]);
    }
  });

  test('succeeds when the referenced rule expression evaluation is a success', () => {
    const rule = Mock.rule('rule-name', () => success);
    const ref = new Ref('rule-name');
    const rules = { 'rule-name': rule };
    const context = new Evaluation.Context('abc', rules);
    const cursor = Mock.cursor(context).at(0);
    const success = Mock.success({ cursor, length: 3 });
    const evaluation = ref.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.REF);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([success]);
    }
  });
});

describe('Ref.flat()', () => {
  test('returns the ref itself', () => {
    const ref = new Ref('rule-name');
    const result = ref.flat();
    expect(result).toBe(ref);
  });
});