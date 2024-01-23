const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const dbConfig = require("./database");
const app = express();

app.use(cors());

// Create a PostgreSQL client
const client = new Client(dbConfig);

// Connect to the PostgreSQL database
async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to the database");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
}

// Define a route to get all todos
app.get("/todos", async (req, res) => {
  try {
    // Use the client to make a SELECT query
    const result = await client.query("SELECT * FROM todo");

    // Send the result as JSON
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying todos:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/health", (req, res) => {
  return res.send("okay");
});
connectToDB();
