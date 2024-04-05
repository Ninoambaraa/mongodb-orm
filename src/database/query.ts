import { ObjectId } from "mongodb";
import {
  QueriesInterface,
  QueryInterface,
} from "../interfaces/query-interface";
import Database from "./database";

export default class Query extends Database implements QueryInterface {
  protected static isWithTrashed: boolean = false;
  protected static isOnlyTrashed: boolean = false;
  protected static fields: object[] = [];
  protected static perPage: number = 10;
  protected static groups: object[] = [];
  protected static $limit: number = 0;
  protected static $skip: number = 0;
  protected static $queries: any[] = [];
  protected static queries: QueriesInterface = {
    $match: {
      $and: [],
      $or: [],
    },
  };

  protected static sorts: object[] = [
    {
      $project: {
        document: "$$ROOT",
      },
    },
    {
      $sort: {},
    },
    {
      $replaceRoot: {
        newRoot: "$document",
      },
    },
  ];

  private static comparationOperators = [
    {
      operator: "=",
      mongoOperator: "eq",
    },
    {
      operator: "!=",
      mongoOperator: "ne",
    },
    {
      operator: ">",
      mongoOperator: "gt",
    },
    {
      operator: "<",
      mongoOperator: "lt",
    },
    {
      operator: ">=",
      mongoOperator: "gte",
    },
    {
      operator: "<=",
      mongoOperator: "lte",
    },
    {
      operator: "in",
      mongoOperator: "in",
    },
    {
      operator: "notIn",
      mongoOperator: "nin",
    },
    {
      operator: "like",
      mongoOperator: "regex",
      options: "i",
    },
  ];

  static where<T extends typeof Query>(
    this: T,
    field: string,
    operator: any,
    value?: any
  ): T {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    return this.whereGenerator(field, _operator, _value);
  }

  private static whereGenerator<T extends typeof Query>(
    this: T,
    field: string,
    operator: string,
    value: any,
    isOr: boolean = false
  ): T {
    let _value = value;
    let _operator = operator;
    const _queries = JSON.parse(JSON.stringify(this.queries));
    let q = {};
    const _logicalOperator = isOr ? "$or" : "$and";

    if (field === "_id" && typeof value === "string") {
      _value = new ObjectId(value);
    }

    const inOperators = ["in", "nin", "notIn"];

    if (
      field === "_id" &&
      inOperators.includes(_operator) &&
      Array.isArray(_value)
    ) {
      _value = _value.map((el) => new ObjectId(el));
    }

    if (_operator === "between") {
      if (!_queries.$match[_logicalOperator])
        _queries.$match[_logicalOperator] = [];

      _queries.$match[_logicalOperator].push({
        [field]: {
          $gte: _value?.[0],
          $lte: _value[1],
        },
      });

      this.queries = _queries;
      return this;
    }

    if (value) {
      const _comparationOperator = this.comparationOperators.find(
        (el) => el.operator === _operator || el.mongoOperator === _operator
      );

      if (_comparationOperator) {
        _operator = _comparationOperator.mongoOperator;
        if (_comparationOperator.mongoOperator === "regex")
          q = { $options: "i" };
      }
    }

    if (!_queries.$match[_logicalOperator])
      _queries.$match[_logicalOperator] = [];

    _queries.$match[_logicalOperator].push({
      [field]: {
        [`$${_operator}`]: _value,
        ...q,
      },
    });

    this.queries = _queries;

    return this;
  }

  static select<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    const _fields = JSON.parse(JSON.stringify(this.fields));
    const isNotEmpty = _fields.length > 0;
    let _project = {
      $project: {
        document: "$$ROOT",
      },
    };

    if (isNotEmpty) {
      _project = {
        ..._fields[0],
      };
    }

    if (typeof fields === "string") {
      _project = {
        ..._project,
        $project: {
          ..._project.$project,
          [fields]: 1,
        },
      };
    } else if (Array.isArray(fields) && fields.length > 0) {
      fields.forEach((field) => {
        _project = {
          ..._project,
          $project: {
            ..._project.$project,
            [field]: 1,
          },
        };
      });
    }

    _fields[0] = _project;
    this.fields = _fields;
    return this;
  }

  protected static resetQuery() {
    this.isWithTrashed = false;
    this.isOnlyTrashed = false;
    this.$limit = 0;
    this.$skip = 0;
    this.perPage = 10;
    this.groups = [];
    this.fields = [];
    this.$queries = JSON.parse(JSON.stringify([]));
    this.queries = {
      $match: {
        $and: [],
        $or: [],
      },
    };

    this.sorts = [
      {
        $project: {
          document: "$$ROOT",
        },
      },
      {
        $sort: {},
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ];
  }

  protected static generateQuery() {
    if (this.softDelete) {
      this?.queries?.$match?.$and?.push({
        isDeleted: {
          $eq: false,
        },
      });
    }

    if (this.isWithTrashed) {
      const _and = this?.queries?.$match?.$and?.filter(
        (item) => item.hasOwnProperty("isDeleted") === false
      );

      if (this?.queries?.$match?.$and) {
        this.queries.$match.$and = _and;
      }
    }

    if (this.isOnlyTrashed) {
      const _and = this?.queries?.$match?.$and?.filter(
        (item) => item.hasOwnProperty("isDeleted") === false
      );

      _and?.push({
        isDeleted: {
          $eq: true,
        },
      });

      if (this?.queries?.$match?.$and) {
        this.queries.$match.$and = _and;
      }
    }

    const _orLength = this?.queries?.$match?.$or?.length || 0;
    const _andLength = this?.queries?.$match?.$and?.length || 0;

    if (_orLength > 0 && _andLength > 0) {
      this?.queries?.$match?.$or?.push({
        $and: this?.queries?.$match?.$and,
      });

      delete this?.queries?.$match?.$and;
    }

    if (_andLength === 0) {
      delete this?.queries?.$match?.$and;
    }

    if (_orLength === 0) {
      delete this?.queries?.$match?.$or;
    }

    if (_orLength > 0 && this.softDelete) {
      this.$queries.push(JSON.parse(JSON.stringify(this.queries)));
    }

    if (
      _orLength > 0 &&
      this.softDelete &&
      !this.isWithTrashed &&
      !this.isOnlyTrashed
    ) {
      const _$queries = JSON.parse(JSON.stringify(this.$queries));

      _$queries.push({
        $match: {
          isDeleted: {
            $eq: false,
          },
        },
      });

      this.$queries = _$queries;
    }

    if (_orLength > 0 && this.softDelete && this.isOnlyTrashed) {
      const _$queries = JSON.parse(JSON.stringify(this.$queries));

      _$queries.push({
        $match: {
          isDeleted: {
            $eq: true,
          },
        },
      });

      this.$queries = _$queries;
    }

    return this;
  }

  static exclude<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    const _fields = JSON.parse(JSON.stringify(this.fields));
    const isNotEmpty = _fields.length > 0;
    let _project = {};

    if (isNotEmpty) {
      _project = {
        ..._fields[0].$project,
      };
    }

    if (typeof fields === "string") {
      _project = {
        ..._project,
        [fields]: 0,
      };

      _fields.push({
        $project: _project,
      });
    } else if (typeof fields !== "string" && fields.length > 0) {
      fields.forEach((field) => {
        _project = {
          ..._project,
          [field]: 0,
        };
      });

      _fields.push({
        $project: _project,
      });
    }

    this.fields = _fields;
    return this;
  }
}
