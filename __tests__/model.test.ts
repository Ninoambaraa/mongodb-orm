import Model from "../src/database/model";

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    isDeleted: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    isDeleted: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    isDeleted: true,
    age: 50,
  },
];

class User extends Model {
  static collection = "users";
}

describe("findAllModel", () => {
  beforeAll(async () => {
    const res = await User.insertMany(users);
  });

  afterAll(async () => {
    await User.deleteAll();
  });

  it("should return all data", async () => {
    const data = await User.findAll();

    expect(data.length).toBe(3);
    expect(data).toEqual(expect.any(Array));
    expect(data[0]).toEqual(expect.any(Object));
  });

  it("should return one data", async () => {
    const data = await User.exclude("_id").get();

    expect(data.length).toBe(3);
    expect(data).toEqual(expect.any(Array));
    expect(data[0]).toEqual(expect.any(Object));
  });

  it("should return where data", async () => {
    const res = await User.where("name", "like", "john").get();

    console.log(res);
    expect(res.length).toBe(1);
  });
});
