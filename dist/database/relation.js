"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = __importDefault(require("./query"));
class Relation extends query_1.default {
    static with(relation, options = {}) {
        if (typeof this[relation] === "function") {
            const model = this[relation]();
            const payload = Object.assign(Object.assign({}, model), { alias: relation, options });
            switch (model.type) {
                case "belongsTo":
                    return this.generateBelongsTo(payload);
                case "hasMany":
                    return this.generateHasMany(payload);
                case "belongsToMany":
                    return this.generateBelongsToMany(payload);
                case "hasManyThrough":
                    return this;
            }
        }
        else {
            console.log(`The ${relation} method does not exist `);
        }
        return this;
    }
    static belongsTo(model, foreignKey, ownerKey = "_id") {
        const collection = typeof model === "string" ? model : model.collection;
        return {
            collection,
            foreignKey: ownerKey,
            localKey: foreignKey,
            type: "belongsTo",
            model: model,
        };
    }
    static hasMany(model, foreignKey, localKey = "_id") {
        const collection = typeof model === "string" ? model : model.collection;
        return {
            collection,
            foreignKey: foreignKey,
            localKey: localKey,
            type: "hasMany",
            model: model,
        };
    }
    static generateBelongsToMany(params) {
        const { collection, pivotCollection, foreignKey, localKey, alias, model } = params;
        const _lookups = JSON.parse(JSON.stringify(this.lookups));
        let isSoftDelete = false;
        let pipeline = [];
        if (typeof model !== "string") {
            isSoftDelete = (model === null || model === void 0 ? void 0 : model.softDelete) || false;
        }
        if (isSoftDelete) {
            pipeline = [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ["$isDeleted", false] }],
                        },
                    },
                },
            ];
        }
        _lookups.push({
            $lookup: {
                from: pivotCollection,
                localField: "_id",
                foreignField: foreignKey,
                as: "pivot",
                pipeline,
            },
        }, {
            $lookup: {
                from: collection,
                localField: `pivot.${localKey}`,
                foreignField: "_id",
                as: alias,
                //         pipeline,
            },
        }, {
            $project: {
                pivot: 0,
            },
        });
        this.lookups = _lookups;
        this.selectFields(params);
        return this;
    }
    static generateBelongsTo(params) {
        const { collection, foreignKey, localKey, alias, model } = params;
        const _lookups = JSON.parse(JSON.stringify(this.lookups));
        let _foreignKey = foreignKey;
        let _localKey = localKey;
        if (this.fields.length > 0) {
            _localKey = `document.${_localKey}`;
        }
        let isSoftDelete = false;
        let pipeline = [];
        if (typeof model !== "string") {
            isSoftDelete = (model === null || model === void 0 ? void 0 : model.softDelete) || false;
        }
        if (isSoftDelete) {
            pipeline = [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ["$isDeleted", false] }],
                        },
                    },
                },
            ];
        }
        const lookup = {
            from: collection,
            localField: `@{_localKey}`,
            foreignField: `@{_foreignKey}`,
            as: alias,
            pipeline: pipeline,
        };
        _lookups.push({
            $lookup: lookup,
        });
        const _unwind = {
            $unwind: {
                path: `$${alias}`,
                preserveNullAndEmptyArrays: true,
            },
        };
        _lookups.push(_unwind);
        this.lookups = _lookups;
        this.selectFields(params);
        return this;
    }
    static generateHasMany(params) {
        const { collection, foreignKey, localKey, alias, model } = params;
        const _lookups = JSON.parse(JSON.stringify(this.lookups));
        let isSoftDelete = false;
        let pipeline = [];
        if (typeof model !== "string") {
            isSoftDelete = (model === null || model === void 0 ? void 0 : model.softDelete) || false;
        }
        if (isSoftDelete) {
            pipeline = [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ["$isDeleted", false] }],
                        },
                    },
                },
            ];
        }
        const lookup = {
            from: collection,
            localField: localKey,
            foreignField: foreignKey,
            as: alias,
            pipeline: pipeline,
        };
        _lookups.push({ $lookup: lookup });
        this.lookups = _lookups;
        this.selectFields(params);
        return this;
    }
    static belongsToMany(model, pivotModel, foreignKey, foreignKeyTarget) {
        const collection = typeof model === "string" ? model : model.collection;
        const pivotCollection = typeof pivotModel === "string" ? pivotModel : pivotModel.collection;
        return {
            collection,
            pivotCollection,
            foreignKey: foreignKey,
            localKey: foreignKeyTarget,
            type: "belongsToMany",
            model,
        };
    }
    static hasManyThrough(model, throughModel, foreignKey, foreignKeyThrough) {
        const collection = typeof model === "string" ? model : model.collection;
        const throughCollection = typeof throughModel === "string" ? throughModel : throughModel.collection;
        return {
            collection,
            throughCollection,
            foreignKey: foreignKeyThrough,
            localKey: foreignKey,
            type: "hasManyThrough",
            model: model,
        };
    }
    static selectFields(params) {
        var _a, _b, _c, _d;
        const { alias, options } = params;
        if ((options === null || options === void 0 ? void 0 : options.select) && ((_a = options === null || options === void 0 ? void 0 : options.select) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            let project = {
                $project: {
                    document: "$$ROOT",
                },
            };
            (_b = options === null || options === void 0 ? void 0 : options.select) === null || _b === void 0 ? void 0 : _b.forEach((field) => {
                project = Object.assign(Object.assign({}, project), { $project: Object.assign(Object.assign({}, project.$project), { [`${alias}.${field}`]: 1 }) });
            });
            const additionals = [
                {
                    $set: {
                        [`document.${alias}`]: `$${alias}`,
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: `$document`,
                    },
                },
            ];
            this.lookups.push(project, ...additionals);
        }
        if ((options === null || options === void 0 ? void 0 : options.exclude) && ((_c = options === null || options === void 0 ? void 0 : options.exclude) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            let project = {
                $project: {},
            };
            (_d = options === null || options === void 0 ? void 0 : options.exclude) === null || _d === void 0 ? void 0 : _d.forEach((field) => {
                project = Object.assign(Object.assign({}, project), { $project: Object.assign(Object.assign({}, project.$project), { [`${alias}.${field}`]: 0 }) });
            });
            this.lookups.push(project);
        }
        return this;
    }
    static resetRelation() {
        this.lookups = [];
        return this;
    }
}
Relation.lookups = [];
exports.default = Relation;
