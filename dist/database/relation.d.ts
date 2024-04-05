import { BelongsToInterface, BelongsToManyInterface, GenerateBelongsToInterface, GenerateBelongsToManyInterface, HasManyThroughInterface, RelationInterface, WithOptionsInterface } from "../interfaces/relation-interface";
import Model from "./model";
import Query from "./query";
export default class Relation extends Query implements RelationInterface {
    protected static lookups: object[];
    static with<T extends typeof Relation>(this: T, relation: string, options?: WithOptionsInterface): T;
    protected static belongsTo(model: typeof Model | string, foreignKey: string, ownerKey?: string): BelongsToInterface;
    protected static hasMany(model: typeof Model | string, foreignKey: string, localKey?: string): BelongsToInterface;
    protected static generateBelongsToMany<T extends typeof Relation>(this: T, params: GenerateBelongsToManyInterface): T;
    protected static generateBelongsTo<T extends typeof Relation>(this: T, params: GenerateBelongsToInterface): T;
    protected static generateHasMany<T extends typeof Relation>(this: T, params: GenerateBelongsToInterface): T;
    protected static belongsToMany(model: typeof Model | string, pivotModel: typeof Model | string, foreignKey: string, foreignKeyTarget: string): BelongsToManyInterface;
    protected static hasManyThrough(model: typeof Model | string, throughModel: typeof Model | string, foreignKey: string, foreignKeyThrough: string): HasManyThroughInterface;
    protected static selectFields(params: GenerateBelongsToInterface): typeof Relation;
    static resetRelation(): typeof Relation;
}
