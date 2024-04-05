import { QueriesInterface, QueryInterface } from "../interfaces/query-interface";
import Database from "./database";
export default class Query extends Database implements QueryInterface {
    protected static isWithTrashed: boolean;
    protected static isOnlyTrashed: boolean;
    protected static fields: object[];
    protected static perPage: number;
    protected static groups: object[];
    protected static $limit: number;
    protected static $skip: number;
    protected static $queries: any[];
    protected static queries: QueriesInterface;
    protected static sorts: object[];
    private static comparationOperators;
    static where<T extends typeof Query>(this: T, field: string, operator: any, value?: any): T;
    private static whereGenerator;
    static select<T extends typeof Query>(this: T, fields?: string | string[]): T;
    protected static resetQuery(): void;
    protected static generateQuery(): typeof Query;
    static exclude<T extends typeof Query>(this: T, fields?: string | string[]): T;
}
