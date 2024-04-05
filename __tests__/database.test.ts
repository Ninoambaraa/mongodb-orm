import Database from "../src/database/database";

describe("getCollection method", () => {
  test("should return a collection", () => {
    const collection = Database["getCollection"]();
    expect(collection).toBeDefined();
  });
});

describe("connect method", () => {
  test("should return a connection", async () => {
    const logSpy = jest.spyOn(console, "log");
    Database["connect"]();
    expect(logSpy).toHaveBeenCalledWith(
      "mongodb trying to connect to database..."
    );
    expect(logSpy).toHaveBeenCalledWith("mongodb connected to database...");
    logSpy.mockRestore();
  });

  test("should throw an error", () => {
    jest.spyOn(Database as any, "connect").mockImplementation(() => {
      throw new Error("mongo failed to connect to database...");
    });

    expect(() => Database["connect"]()).toThrowError(
      "mongo failed to connect to database..."
    );

    (Database as any)["connect"].mockRestore();
  });
});
