import { Collection } from "mongodb";
import { DatabaseInterface } from "../interfaces/database-interface";
declare class Database implements DatabaseInterface {
    protected static collection: string;
    protected static softDelete: boolean;
    protected static timestamps: boolean;
    private static db;
    protected static getCollection(): Collection;
    private static connect;
}
export default Database;
