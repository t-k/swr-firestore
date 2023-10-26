import { sum as fsSum } from "firebase/firestore";
import type { Paths } from "../util/type";
import type { AggregateFieldBase } from "./common";

type SumAggregateField<T> = AggregateFieldBase<T> & {
  aggregateType: "sum";
};

const sum = <T>(field: Paths<T>) => fsSum(field) as SumAggregateField<T>;

export default sum;
