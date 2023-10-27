import type { Paths } from "../util/type";

export type AggregateFieldBase<T> = {
  _internalFieldPath: {
    segments: Paths<T>[];
    offset: number;
    len: number;
  };
  readonly type: "AggregateField";
  readonly aggregateType: "sum" | "avg" | "count";
};

export interface AvgAggregateField<T> extends AggregateFieldBase<T> {
  readonly aggregateType: "avg";
}

export interface SumAggregateField<T> extends AggregateFieldBase<T> {
  readonly aggregateType: "sum";
}
