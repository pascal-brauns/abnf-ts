import Cursor from './Cursor';
import Node from './Node';

export interface Rule {
  name: string;
  expression: Expression;
  evaluate(input: string): Node;
};

export enum Component {
  ALTERNATION = 'ALTERNATION',
  CONCATENATION = 'CONCATENATION',
  GROUP = 'GROUP',
  LITERAL = 'LITERAL',
  OPTION = 'OPTION',
  PROSE = 'PROSE',
  REF = 'REF',
  REPETITION = 'REPETITION',

  // test
  MOCK = 'MOCK',
};

export enum Reason {
  ALTERNATION_NO_MATCH = 'ALTERNATION_NO_MATCH',
  CONCATENATION_INVALID_SEQUENCE = 'CONCATENATION_INVALID_SEQUENCE',
  LITERAL_CHARSET_MISMATCH = 'LITERAL_CHARSET_MISMATCH',
  REPETITION_LENGTH_BELOW_MINIMUM = 'REPETITION_LENGTH_BELOW_MINIMUM',
  REPETITION_NO_PROGRESS = 'REPETITION_NO_PROGRESS',
  PROSE_NOT_EVALUABLE = 'PROSE_NOT_EVALUABLE',
  REF_RULE_NOT_FOUND = 'REF_RULE_NOT_FOUND',
  REF_RULE_EVALUATION_FAILED = 'REF_RULE_EVALUATION_FAILED',
  REF_RULE_CYCLIC_RECURSION = 'REF_RULE_CYCLIC_RECURSION',
  GROUP_EXPRESSION_FAILED = 'GROUP_EXPRESSION_FAILED',

  // test
  MOCK_FAILURE = 'MOCK_FAILURE'
};

export interface Expression {
  type: Component;
  evaluate: (cursor: Cursor) => Node;
  flat(): Expression;
};

export type Evaluate = (cursor: Cursor) => Node;

export enum Result {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type Success = {
  readonly type: Result.SUCCESS;
  readonly length: number;
};

export type Failure = {
  readonly type: Result.FAILURE;
  readonly reason: Reason;
};

export type Data<T extends Result> = (T extends Result.SUCCESS ? Success : (T extends Result.FAILURE ? Failure : never));

export type Input<T extends string = string> = {
  type?: `${Component}`;
  path?: T[];
  name?: T;
};