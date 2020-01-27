const bodyParser = require("body-parser");
const express = require("express");
const server = express();
var cors = require("cors");

const port = +(process.env.PORT || 9000);

const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = "./data/db.sqlite";
const BAD_REQUEST = 400;

const db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE measurements (
        id char(36) default (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))), homebaseId integer,
         timestamp datetime default CURRENT_TIMESTAMP, 
         humidity numeric, 
         temperature numeric, 
         gas numeric, 
         dust numeric, 
         pressure numeric,
         volume numeric, 
         light numeric, 
         primary key (id))`,
      err => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
        }
      }
    );
  }
});

// Parse JSON (application/json content-type)
server.use(bodyParser.json());

// Use Cross Origin Resource
server.use(cors());

// API
server.get("/", (req, res) => {
  res.json({ serverHealth: "ack" });
});

// API Health
server.get("/health", (req, res) => {
  res.json({ apiHealth: "ack" });
});

// DB Health
server.get("/db-health", (req, res) => {
  const sql = "SELECT 1 FROM measurements LIMIT 1";
  const params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(BAD_REQUEST).json({ error: err.message });
    } else {
      res.json({ dataHealth: "ack" });
    }
  });
});

// INSERT New Measurement
server.get(
  "/measurements/:homebaseId/:humidity/:temperature/:dust/:gas/:pressure/:volume/:light",
  (req, res) => {
    const insertQuery =
      "INSERT INTO measurements(homebaseId, humidity, temperature, dust, gas, pressure, volume, light) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(
      insertQuery,
      [
        req.params.homebaseId,
        req.params.humidity,
        req.params.temperature,
        req.params.dust,
        req.params.gas,
        req.params.pressure,
        req.params.volume,
        req.params.light
      ],
      function(err) {
        if (err) {
          res.status(BAD_REQUEST).json({ error: err });
        } else {
          res.json({ status: "ok" });
        }
      }
    );
  }
);

// Get latest status
server.get("/status/:homebaseId", (req, res) => {
  const sql =
    "SELECT * FROM measurements WHERE homebaseId = ? ORDER BY timestamp DESC LIMIT 1";
  const params = [req.params.homebaseId];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(BAD_REQUEST).json({ error: err.message });
    } else {
      if (rows[0]) {
        const results = [];

        const lightChart = { id: "Light", data: [] };
        const volumeChart = { id: "Volume", data: [] };
        const temperatureChart = { id: "Temprature", data: [] };
        const humidityChart = { id: "Humidity", data: [] };
        const dustChart = { id: "Dust", data: [] };
        const gasChart = { id: "Gas", data: [] };
        const pressureChart = { id: "Pressure", data: [] };
        const happinessChart = { id: "Happiness", data: [] };

        rows.forEach(measurement => {
          const lightEntry = {
            y: measurement.light
          };
          lightChart.data.push(lightEntry);

          const volumeEntry = {
            y: measurement.volume
          };
          volumeChart.data.push(volumeEntry);

          const temperatureEntry = {
            y: measurement.temperature
          };
          temperatureChart.data.push(temperatureEntry);

          const humidityEntry = {
            y: measurement.humidity
          };
          humidityChart.data.push(humidityEntry);

          const dustEntry = {
            y: measurement.dust
          };
          dustChart.data.push(dustEntry);

          const gasEntry = {
            y: measurement.gas
          };
          gasChart.data.push(gasEntry);

          const pressureEntry = {
            y: measurement.pressurer
          };
          pressureChart.data.push(pressureEntry);

          const happyStatus = {
            y: 100
          };

          happinessChart.data.push(happyStatus);
        });

        results.push(
          lightChart,
          volumeChart,
          temperatureChart,
          dustChart,
          gasChart,
          humidityChart,
          pressureChart,
          happinessChart
        );

        res.json(results);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
