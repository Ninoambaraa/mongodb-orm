import { ObjectId } from "mongodb";
import { ModelInterface } from "../interfaces/model-interface";
import Relation from "./relation";
export default class Model extends Relation implements ModelInterface {
    static findAll(): Promise<object[]>;
    static get(fields?: string | string[]): Promise<object[]>;
    static insertMany(payload: object[]): Promise<ObjectId[]>;
    static deleteAll(): Promise<import("mongodb").DeleteResult>;
    protected static aggregate(): import("mongodb").AggregationCursor<import("bson").Document>;
}
