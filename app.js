const express = require("express");
const app = express();
app.use(express.json());

const router = require("./config/routes.config");
app.use("/api/employees", router);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Exporting app for testing purposes
