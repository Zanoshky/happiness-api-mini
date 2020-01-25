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
      rows[0].happiness = 100;
      res.json(rows);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
