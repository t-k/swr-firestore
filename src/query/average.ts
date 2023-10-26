import { average as fsAvg } from "firebase/firestore";
import type { Paths } from "../util/type";
import type { AggregateFieldBase } from "./common";

type AvgAggregateField<T> = AggregateFieldBase<T> & {
  aggregateType: "sum";
};

const average = <T>(field: Paths<T>) => fsAvg(field) as AvgAggregateField<T>;

export default average;
