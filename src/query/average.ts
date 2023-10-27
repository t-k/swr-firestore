import { average } from "firebase/firestore";
import type { Paths } from "../util/type";
import type { AvgAggregateField } from "./common";

export default average as <T>(field: Paths<T>) => AvgAggregateField<T>;
