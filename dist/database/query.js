"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_1 = __importDefault(require("./database"));
class Query extends database_1.default {
    static where(field, operator, value) {
        let _value = value || operator;
        let _operator = value ? operator : "eq";
        return this.whereGenerator(field, _operator, _value);
    }
    static whereGenerator(field, operator, value, isOr = false) {
        let _value = value;
        let _operator = operator;
        const _queries = JSON.parse(JSON.stringify(this.queries));
        let q = {};
        const _logicalOperator = isOr ? "$or" : "$and";
        if (field === "_id" && typeof value === "string") {
            _value = new mongodb_1.ObjectId(value);
        }
        const inOperators = ["in", "nin", "notIn"];
        if (field === "_id" &&
            inOperators.includes(_operator) &&
            Array.isArray(_value)) {
            _value = _value.map((el) => new mongodb_1.ObjectId(el));
        }
        if (_operator === "between") {
            if (!_queries.$match[_logicalOperator])
                _queries.$match[_logicalOperator] = [];
            _queries.$match[_logicalOperator].push({
                [field]: {
                    $gte: _value === null || _value === void 0 ? void 0 : _value[0],
                    $lte: _value[1],
                },
            });
            this.queries = _queries;
            return this;
        }
        if (value) {
            const _comparationOperator = this.comparationOperators.find((el) => el.operator === _operator || el.mongoOperator === _operator);
            if (_comparationOperator) {
                _operator = _comparationOperator.mongoOperator;
                if (_comparationOperator.mongoOperator === "regex")
                    q = { $options: "i" };
            }
        }
        if (!_queries.$match[_logicalOperator])
            _queries.$match[_logicalOperator] = [];
        _queries.$match[_logicalOperator].push({
            [field]: Object.assign({ [`$${_operator}`]: _value }, q),
        });
        this.queries = _queries;
        return this;
    }
    static select(fields = "") {
        const _fields = JSON.parse(JSON.stringify(this.fields));
        const isNotEmpty = _fields.length > 0;
        let _project = {
            $project: {
                document: "$$ROOT",
            },
        };
        if (isNotEmpty) {
            _project = Object.assign({}, _fields[0]);
        }
        if (typeof fields === "string") {
            _project = Object.assign(Object.assign({}, _project), { $project: Object.assign(Object.assign({}, _project.$project), { [fields]: 1 }) });
        }
        else if (Array.isArray(fields) && fields.length > 0) {
            fields.forEach((field) => {
                _project = Object.assign(Object.assign({}, _project), { $project: Object.assign(Object.assign({}, _project.$project), { [field]: 1 }) });
            });
        }
        _fields[0] = _project;
        this.fields = _fields;
        return this;
    }
    static resetQuery() {
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
    static generateQuery() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        if (this.softDelete) {
            (_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.queries) === null || _a === void 0 ? void 0 : _a.$match) === null || _b === void 0 ? void 0 : _b.$and) === null || _c === void 0 ? void 0 : _c.push({
                isDeleted: {
                    $eq: false,
                },
            });
        }
        if (this.isWithTrashed) {
            const _and = (_f = (_e = (_d = this === null || this === void 0 ? void 0 : this.queries) === null || _d === void 0 ? void 0 : _d.$match) === null || _e === void 0 ? void 0 : _e.$and) === null || _f === void 0 ? void 0 : _f.filter((item) => item.hasOwnProperty("isDeleted") === false);
            if ((_h = (_g = this === null || this === void 0 ? void 0 : this.queries) === null || _g === void 0 ? void 0 : _g.$match) === null || _h === void 0 ? void 0 : _h.$and) {
                this.queries.$match.$and = _and;
            }
        }
        if (this.isOnlyTrashed) {
            const _and = (_l = (_k = (_j = this === null || this === void 0 ? void 0 : this.queries) === null || _j === void 0 ? void 0 : _j.$match) === null || _k === void 0 ? void 0 : _k.$and) === null || _l === void 0 ? void 0 : _l.filter((item) => item.hasOwnProperty("isDeleted") === false);
            _and === null || _and === void 0 ? void 0 : _and.push({
                isDeleted: {
                    $eq: true,
                },
            });
            if ((_o = (_m = this === null || this === void 0 ? void 0 : this.queries) === null || _m === void 0 ? void 0 : _m.$match) === null || _o === void 0 ? void 0 : _o.$and) {
                this.queries.$match.$and = _and;
            }
        }
        const _orLength = ((_r = (_q = (_p = this === null || this === void 0 ? void 0 : this.queries) === null || _p === void 0 ? void 0 : _p.$match) === null || _q === void 0 ? void 0 : _q.$or) === null || _r === void 0 ? void 0 : _r.length) || 0;
        const _andLength = ((_u = (_t = (_s = this === null || this === void 0 ? void 0 : this.queries) === null || _s === void 0 ? void 0 : _s.$match) === null || _t === void 0 ? void 0 : _t.$and) === null || _u === void 0 ? void 0 : _u.length) || 0;
        if (_orLength > 0 && _andLength > 0) {
            (_x = (_w = (_v = this === null || this === void 0 ? void 0 : this.queries) === null || _v === void 0 ? void 0 : _v.$match) === null || _w === void 0 ? void 0 : _w.$or) === null || _x === void 0 ? void 0 : _x.push({
                $and: (_z = (_y = this === null || this === void 0 ? void 0 : this.queries) === null || _y === void 0 ? void 0 : _y.$match) === null || _z === void 0 ? void 0 : _z.$and,
            });
            (_1 = (_0 = this === null || this === void 0 ? void 0 : this.queries) === null || _0 === void 0 ? void 0 : _0.$match) === null || _1 === void 0 ? true : delete _1.$and;
        }
        if (_andLength === 0) {
            (_3 = (_2 = this === null || this === void 0 ? void 0 : this.queries) === null || _2 === void 0 ? void 0 : _2.$match) === null || _3 === void 0 ? true : delete _3.$and;
        }
        if (_orLength === 0) {
            (_5 = (_4 = this === null || this === void 0 ? void 0 : this.queries) === null || _4 === void 0 ? void 0 : _4.$match) === null || _5 === void 0 ? true : delete _5.$or;
        }
        if (_orLength > 0 && this.softDelete) {
            this.$queries.push(JSON.parse(JSON.stringify(this.queries)));
        }
        if (_orLength > 0 &&
            this.softDelete &&
            !this.isWithTrashed &&
            !this.isOnlyTrashed) {
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
    static exclude(fields = "") {
        const _fields = JSON.parse(JSON.stringify(this.fields));
        const isNotEmpty = _fields.length > 0;
        let _project = {};
        if (isNotEmpty) {
            _project = Object.assign({}, _fields[0].$project);
        }
        if (typeof fields === "string") {
            _project = Object.assign(Object.assign({}, _project), { [fields]: 0 });
            _fields.push({
                $project: _project,
            });
        }
        else if (typeof fields !== "string" && fields.length > 0) {
            fields.forEach((field) => {
                _project = Object.assign(Object.assign({}, _project), { [field]: 0 });
            });
            _fields.push({
                $project: _project,
            });
        }
        this.fields = _fields;
        return this;
    }
}
Query.isWithTrashed = false;
Query.isOnlyTrashed = false;
Query.fields = [];
Query.perPage = 10;
Query.groups = [];
Query.$limit = 0;
Query.$skip = 0;
Query.$queries = [];
Query.queries = {
    $match: {
        $and: [],
        $or: [],
    },
};
Query.sorts = [
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
Query.comparationOperators = [
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
exports.default = Query;
