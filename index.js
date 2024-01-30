const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const dbConfig = require("./database");
const app = express();

// add body parser middleware to my express app
app.use(express.json()); // this is for json body type middleware
app.use(cors());

// Create a PostgreSQL client
const client = new Client(dbConfig);

// Connect to the PostgreSQL database
async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to the database");
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
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

// post todo request
app.post("/todo", async (req, res) => {
  try {
    const payload = req.body;

    // using pg client, insert the todo into todo table in database
    const result = await client.query(
      "INSERT INTO todo (task, created_at, completed) VALUES ($1, $2, $3) RETURNING *",
      [payload.task, payload.createdAt, payload.completed]
    );

    // send the todo id in the response as json
    res.json({ id: result.rows[0].id, status: "success" });
  } catch (err) {
    res.json({ error: err.message }).status(400);
  }
});

//delete todo
app.delete("/todo/:id", async (req, res) => {
  try {
    const id = req.params.id;

    //This line extracts the value of the id parameter from the request URL.
    //In Express.js, req.params is an object containing properties mapped to the
    //named route parameters in the URL.
    const result = await client.query("DELETE FROM todo WHERE id = $1", [id]);
    res.json({ status: "success" }).status(200);
  } catch (err) {
    res.json({ error: err.message }).status(400);
  }
});

//update a todo
app.patch("/todo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    const result = await client.query(
      "UPDATE todo SET  completed = $1 WHERE id = $2",
      [payload.completed, id]
    );
    res.json({ status: "success" }).status(200);
  } catch (err) {
    res.json({ error: err.message }).status(400);
  }
});
app.get("/health", (req, res) => {
  return res.send("okay");
});
connectToDB();
