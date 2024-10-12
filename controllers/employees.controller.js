const path = require("path");
const fs = require("fs");

function loadEmployees() {
  const data = fs.readFileSync(path.join(__dirname, "../employees.json"));
  return JSON.parse(data);
}

function saveEmployees(employees) {
  fs.writeFileSync(
    path.join(__dirname, "../employees.json"),
    JSON.stringify(employees, null, 2)
  );
}

// GET /api/employees
exports.getEmployees = (req, res) => {
  try {
    const employees = loadEmployees();
    const { page, user, badges } = req.query;

    if (!page && !user && !badges) {
      return res.json(employees);
    }

    if (user === "true") {
      const userEmployees = employees.filter(
        (emp) => emp.privileges === "user"
      );
      return res.json(userEmployees);
    }

    if (badges) {
      const badgeEmployees = employees.filter(
        (emp) => emp.badges && emp.badges.includes(badges)
      );
      return res.json(badgeEmployees);
    }

    if (page) {
      const pageNumber = parseInt(page);
      const limit = 2;
      const startIndex = limit * (pageNumber - 1);
      const endIndex = startIndex + limit;
      const results = employees.slice(startIndex, endIndex);
      return res.json(results);
    }

    res.json(employees);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// GET /api/employees/oldest
exports.getOldestEmployee = (req, res) => {
  try {
    const employees = loadEmployees();
    const oldest = employees.reduce((prev, current) => {
      return prev.age > current.age ? prev : current;
    });
    res.json(oldest);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// POST /api/employees
exports.createEmployee = (req, res) => {
  try {
    const newEmployee = req.body;

    // Manual validation
    if (!validateEmployee(newEmployee)) {
      return res.status(400).json({ code: "bad_request" });
    }

    const employees = loadEmployees();
    employees.push(newEmployee);
    saveEmployees(employees);

    res
      .status(201)
      .json({
        message: "Employee created successfully",
        employee: newEmployee,
      });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// GET /api/employees/:name
exports.getEmployeeByName = (req, res) => {
  try {
    const employees = loadEmployees();
    const { name } = req.params;
    const employee = employees.find((emp) => emp.name === name);

    if (!employee) {
      return res.status(404).json({ code: "not_found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// Validation function
function validateEmployee(employee) {
  const requiredFields = ["name", "age", "phone", "privileges"];
  const stringFields = ["name", "privileges"];
  const numberFields = ["age"];

  // Check for required fields
  for (const field of requiredFields) {
    if (!(field in employee)) {
      return false;
    }
  }

  // Check data types of string fields
  for (const field of stringFields) {
    if (typeof employee[field] !== "string") {
      return false;
    }
  }

  // Check data types of number fields
  for (const field of numberFields) {
    if (typeof employee[field] !== "number") {
      return false;
    }
  }

  // Validate phone object
  if (
    typeof employee.phone !== "object" ||
    !employee.phone.personal ||
    typeof employee.phone.personal !== "string"
  ) {
    return false;
  }

  return true;
}
