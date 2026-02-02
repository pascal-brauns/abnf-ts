import * as Evaluation from "@/Evaluation";
import Grammar from "./Grammar";

const grammar = Grammar.compile('lenient', `
a = a / b
b = a
`);

describe('Grammar', () => {
  test('fails a cyclic rule evaluation', () => {
    const rule = grammar.rule('a');
    const graph = rule.graph('abc');
    const result = graph.find({ type: 'REF', path: ['a', 'a'] });

    if (result === null) {
      fail('result should not be null');
    }

    expect(result.expression).toBe(Evaluation.Type.Component.REF);
    expect(result.children.length).toBe(1);

    if (!result.children[0]) {
      fail('result.children[0] should exist');
    }

    const alternation = result.children[0];
    expect(alternation.expression).toBe(Evaluation.Type.Component.ALTERNATION);
    expect(alternation.children.length).toBe(2);

    if (!alternation.children[0]) {
      fail('alternation.children[0] should exist');
    }

    const ref = alternation.children[0];
    expect(ref.expression).toBe(Evaluation.Type.Component.REF);

    expect(ref.data.type).toBe(Evaluation.Type.Result.FAILURE);
    if (ref?.data.type === Evaluation.Type.Result.FAILURE) {
      expect(ref?.data.reason).toBe(Evaluation.Type.Reason.REF_RULE_CYCLIC_RECURSION);
    }

  })
})