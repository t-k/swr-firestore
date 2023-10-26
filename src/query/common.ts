import type { Paths } from "../util/type";

export type AggregateFieldBase<T> = {
  _internalFieldPath: {
    segments: Paths<T>[];
    offset: number;
    len: number;
  };
  type: "AggregateField";
};
