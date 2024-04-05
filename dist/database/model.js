"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const relation_1 = __importDefault(require("./relation"));
class Model extends relation_1.default {
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collection = this.getCollection();
                return collection.find().toArray();
            }
            catch (error) {
                throw error;
            }
        });
    }
    static get(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (fields)
                    this.select(fields);
                const aggregate = this.aggregate();
                this.resetQuery();
                this.resetRelation();
                return aggregate.toArray();
            }
            catch (error) {
                throw error;
            }
        });
    }
    static insertMany(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collection = this.getCollection();
                const data = yield collection.insertMany(payload);
                const result = [];
                for (var key in data.insertedIds) {
                    result.push(data.insertedIds[key]);
                }
                return result;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collection = this.getCollection();
                const res = yield collection.deleteMany({});
                return res;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static aggregate() {
        var _a, _b;
        try {
            const collection = this.getCollection();
            const _pipeline = [];
            this.generateQuery();
            if (this.$queries.length > 0) {
                this.$queries.forEach((query) => {
                    _pipeline.push(query);
                });
            }
            else {
                _pipeline.push(this.queries);
            }
            if (Object.entries(((_b = (_a = this === null || this === void 0 ? void 0 : this.sorts) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.$sort) || {}).length > 0)
                _pipeline.push(...this.sorts);
            if (this.fields.length > 0) {
                _pipeline.push(...this.fields);
            }
            if (this.groups.length > 0)
                _pipeline.push(...this.groups);
            if (this.groups.length === 0 && this.lookups.length > 0)
                _pipeline.push(...this.lookups);
            _pipeline.push({
                $project: {
                    document: 0,
                },
            });
            if (this.$skip > 0)
                _pipeline.push({ $skip: this.$skip });
            if (this.$limit > 0)
                _pipeline.push({ $limit: this.$limit });
            return collection.aggregate([..._pipeline]);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Model;
