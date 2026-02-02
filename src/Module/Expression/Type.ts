import * as Source from '@/Source';
import * as Evaluation from '@/Evaluation';

export type ParseContext = {
  cursor: Source.Cursor;
  parse: (cursor: Source.Cursor) => Evaluation.Type.Expression;
};

export type Parse<T extends Evaluation.Type.Expression> = (context: ParseContext) => T;