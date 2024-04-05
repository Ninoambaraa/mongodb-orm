import { ObjectId } from "mongodb";
import { ModelInterface } from "../interfaces/model-interface";
import Relation from "./relation";

export default class Model extends Relation implements ModelInterface {
  static async findAll(): Promise<object[]> {
    try {
      const collection = this.getCollection();

      return collection.find().toArray();
    } catch (error) {
      throw error;
    }
  }

  static async get(fields?: string | string[]): Promise<object[]> {
    try {
      if (fields) this.select(fields);

      const aggregate = this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  static async insertMany(payload: object[]) {
    try {
      const collection = this.getCollection();

      const data = await collection.insertMany(payload);

      const result: ObjectId[] = [];

      for (var key in data.insertedIds) {
        result.push(data.insertedIds[key]);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAll() {
    try {
      const collection = this.getCollection();

      const res = await collection.deleteMany({});

      return res;
    } catch (error) {
      throw error;
    }
  }

  protected static aggregate() {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();

      if (this.$queries.length > 0) {
        this.$queries.forEach((query) => {
          _pipeline.push(query);
        });
      } else {
        _pipeline.push(this.queries);
      }

      if (
        Object.entries(
          (this?.sorts?.[1] as { $sort?: Record<string, any> })?.$sort || {}
        ).length > 0
      )
        _pipeline.push(...this.sorts);

      if (this.fields.length > 0) {
        _pipeline.push(...this.fields);
      }

      if (this.groups.length > 0) _pipeline.push(...this.groups);
      if (this.groups.length === 0 && this.lookups.length > 0)
        _pipeline.push(...this.lookups);

      _pipeline.push({
        $project: {
          document: 0,
        },
      });

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      return collection.aggregate([..._pipeline]);
    } catch (error) {
      throw error;
    }
  }
}
