// tests/employees.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app");

const employeesDataPath = path.join(__dirname, "../employees.json");
const originalEmployeesData = fs.readFileSync(employeesDataPath);

beforeEach(() => {
  // Reset employees.json to original data
  fs.writeFileSync(employeesDataPath, originalEmployeesData);
});

afterAll(() => {
  // Restore employees.json to original data after all tests
  fs.writeFileSync(employeesDataPath, originalEmployeesData);
});

describe("Employees API", () => {
  describe("GET /api/employees", () => {
    it("should return all employees when no query parameters are provided", async () => {
      const res = await request(app).get("/api/employees");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      // You can add more specific checks based on your data
    });

    it('should return employees with privileges "user" when user=true', async () => {
      const res = await request(app)
        .get("/api/employees")
        .query({ user: "true" });
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((employee) => {
        expect(employee.privileges).toBe("user");
      });
    });

    it("should return employees with specified badge when badges query parameter is provided", async () => {
      const badge = "black"; // Ensure 'black' badge exists in your data
      const res = await request(app)
        .get("/api/employees")
        .query({ badges: badge });
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((employee) => {
        expect(employee.badges).toContain(badge);
      });
    });

    it("should return paginated employees when page query parameter is provided", async () => {
      const res = await request(app).get("/api/employees").query({ page: 1 });
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(2); // Limit is set to 2
    });
  });

  describe("GET /api/employees/oldest", () => {
    it("should return the oldest employee", async () => {
      const res = await request(app).get("/api/employees/oldest");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("age");
      // Additional assertions can be added based on your data
    });
  });

  describe("GET /api/employees/:name", () => {
    it("should return the employee with the given name", async () => {
      const name = "Sue"; // Replace with a name that exists in your data
      const res = await request(app).get(
        `/api/employees/${encodeURIComponent(name)}`
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("name", name);
    });

    it("should return 404 if the employee is not found", async () => {
      const name = "Nonexistent Name";
      const res = await request(app).get(
        `/api/employees/${encodeURIComponent(name)}`
      );
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("code", "not_found");
    });
  });

  describe("POST /api/employees", () => {
    it("should create a new employee", async () => {
      const newEmployee = {
        name: "Test Employee",
        age: 30,
        phone: {
          personal: "123-456-7890",
        },
        privileges: "user",
        badges: ["test"],
        points: [{ points: 10 }],
      };

      const res = await request(app).post("/api/employees").send(newEmployee);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty(
        "message",
        "Employee created successfully"
      );
      expect(res.body).toHaveProperty("employee");
      expect(res.body.employee).toMatchObject(newEmployee);

      // Verify that the new employee is added
      const getRes = await request(app).get(
        `/api/employees/${encodeURIComponent(newEmployee.name)}`
      );
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toMatchObject(newEmployee);
    });

    it("should return 400 when the employee data is invalid", async () => {
      const invalidEmployee = {
        age: "thirty", // Invalid age type
        phone: "1234567890", // Invalid phone type
        privileges: "user",
        // Missing 'name' field
      };

      const res = await request(app)
        .post("/api/employees")
        .send(invalidEmployee);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ code: "bad_request" });
    });
  });
});
