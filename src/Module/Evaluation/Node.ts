import * as Type from './Type';
import Cursor from './Cursor';

export default class Node<T extends Type.Result = Type.Result> {
  public readonly cursor: Cursor;
  public readonly expression: Type.Component;
  public readonly children: Node[];
  public readonly data: Type.Data<T>;

  static success = (length: number): Type.Data<Type.Result.SUCCESS> => ({
    type: Type.Result.SUCCESS,
    length,
  });

  static failure = (reason: Type.Reason): Type.Data<Type.Result.FAILURE> => ({
    type: Type.Result.FAILURE,
    reason,
  });

  constructor(init: Omit<Node<T>, 'text'>) {    
    this.cursor = init.cursor;
    this.expression = init.expression;
    this.children = init.children;
    this.data = init.data;
  }

  text() {
    if (this.data.type === Type.Result.FAILURE) {
      return null;
    }
    const { input } = this.cursor.state.context;
    const start = this.cursor.state.index;
    const end = this.cursor.state.index + this.data.length;
    return input.substring(start, end);
  }
}

