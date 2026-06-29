const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vehicle Booking Management API");
});

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
