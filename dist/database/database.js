"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./connectors/mongodb");
class Database {
    static getCollection() {
        if (!this.db) {
            this.connect();
        }
        return this.db.collection(this.collection);
    }
    static connect() {
        try {
            console.log("mongodb trying to connect to database...");
            mongodb_1.client.connect();
            const db = mongodb_1.client.db(mongodb_1.MONGOLOQUENT_DATABASE);
            console.log("mongodb connected to database...");
            this.db = db;
        }
        catch (error) {
            throw new Error("mongodb failed to connect to database...");
        }
    }
}
Database.collection = "collection";
Database.softDelete = false;
Database.timestamps = false;
exports.default = Database;
