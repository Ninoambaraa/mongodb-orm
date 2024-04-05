import Model from "../src/database/model";
import Relation from "../src/database/relation";

class Country extends Model {
  protected collection = "countries";

  static products() {
    return this.hasManyThrough(Product, User, "countryId", "userId");
  }
}

class User extends Model {
  protected collection = "users";

  static products() {
    return this.hasMany(Product, "userId", "_id");
  }

  static roles() {
    return this.belongsToMany(Role, "userRoles", "userId", "roleId");
  }
}

class Product extends Model {
  protected collection = "products";

  static user() {
    return this.belongsTo(User, "userId", "_id");
  }
}

class Role extends Model {
  protected collection = "roles";
}

beforeEach(() => {
  Relation["resetRelation"]();
});

describe("Relation - with method", () => {
  test("hasMany should return this", () => {
    const result = User["with"]("products");

    expect(result).toBe(User);
    expect(result).toEqual(expect.any(Function));
  });

  test("belongsTo should return this", () => {
    const result = Product["with"]("user");

    expect(result).toBe(Product);
    expect(result).toEqual(expect.any(Function));
  });
});
