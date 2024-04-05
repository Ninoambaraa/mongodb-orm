import { Db, Collection } from "mongodb";
import { MONGOLOQUENT_DATABASE, client } from "./connectors/mongodb";
import { DatabaseInterface } from "../interfaces/database-interface";

class Database implements DatabaseInterface {
  protected static collection: string = "collection";
  protected static softDelete: boolean = false;
  protected static timestamps: boolean = false;
  private static db: Db;

  protected static getCollection(): Collection {
    if (!this.db) {
      this.connect();
    }
    return this.db.collection(this.collection);
  }

  private static connect(): void {
    try {
      console.log("mongodb trying to connect to database...");
      client.connect();
      const db = client.db(MONGOLOQUENT_DATABASE);
      console.log("mongodb connected to database...");
      this.db = db;
    } catch (error) {
      throw new Error("mongodb failed to connect to database...");
    }
  }
}

export default Database;
