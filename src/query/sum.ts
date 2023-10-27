import { sum } from "firebase/firestore";
import type { Paths } from "../util/type";
import type { SumAggregateField } from "./common";

export default sum as <T>(field: Paths<T>) => SumAggregateField<T>;
