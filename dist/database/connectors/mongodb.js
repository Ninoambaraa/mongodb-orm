"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.MONGOLOQUENT_URI = exports.MONGOLOQUENT_DATABASE = void 0;
const mongodb_1 = require("mongodb");
require("dotenv/config");
let databaseName = process.env.MONGOLOQUENT_DATABASE || "mongoloquent";
if (process.env.NODE_ENV === "test") {
    databaseName =
        process.env.MONGOLOQUENT_DATABASE_TEST || databaseName + "_test";
}
exports.MONGOLOQUENT_DATABASE = databaseName;
exports.MONGOLOQUENT_URI = process.env.MONGOLOQUENT_URI || "mongodb://localhost:27017";
exports.client = new mongodb_1.MongoClient(exports.MONGOLOQUENT_URI, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
