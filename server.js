const express = require("express");
const server = express();

const body_parser = require("body-parser");
const port = 9000;

// diskdb connection
const db = require("diskdb");
db.connect("./data", ["measurements"]);

// parse JSON (application/json content-type)
server.use(body_parser.json());

server.get(
  "/measurements/:temperature/:humidity/:pressure/:light/:volume/:dust",
  (req, res) => {
    const measurement = {
      timestamp: new Date(),
      humidity: req.params.humidity,
      temperature: req.params.temperature,
      dust: req.params.dust,
      gas: req.params.gas,
      volume: req.params.gas,
      light: req.params.light,
      homebaseId: req.params.homebaseId
    };

    db.measurements.save(measurement);
    console.log(measurement);
    res.json(measurement);
  }
);

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
