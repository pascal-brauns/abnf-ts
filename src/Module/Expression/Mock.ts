import { Component } from '../Evaluation/Type';
import Context from '../Evaluation/Context';
import Cursor from '../Evaluation/Cursor';
import Path from '@/Evaluation/Path';
import Node from '../Evaluation/Node';

import * as Evaluation from '@/Evaluation';

type Expression = Evaluation.Type.Expression;
type Rule = Evaluation.Type.Rule;

export const cursor = (context: Context): Cursor => new Cursor({
  context,
  index: 0,
  depth: 0,
  path: new Path(),
  nameMap: new Map<number, Set<string>>()
});

export const failure = (cursor: Cursor) => new Node({
  cursor,
  data: {
    type: Evaluation.Type.Result.FAILURE,
    reason: Evaluation.Type.Reason.MOCK_FAILURE
  },
  expression: Component.MOCK,
  children: [],
});

export const success = (init: { cursor: Cursor; length?: number; }) => new Node({
  cursor: init.cursor,
  data: {
    type: Evaluation.Type.Result.SUCCESS,
    length: init.length ?? 0
  },
  expression: Component.MOCK,
  children: [],
});

type Evaluate = () => Node;

export const expression = (evaluates: [Evaluate, ...Evaluate[]]): Expression => {
  let calls = 0;
  return ({
    type: Component.MOCK,
    evaluate: () => (evaluates[calls++] ?? evaluates[0])(),
    flat() {
      return this;
    }
  })
};

export const rule = (name: string, evaluate: Evaluate): Rule => ({
  name,
  expression: expression([evaluate]),
  evaluate,
});