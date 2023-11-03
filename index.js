const express = require("express");

const app = express();

const PORT = 3030;

app.get("/test", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("/test/more", (req, res) => {
  res.json({ message: "This is another test case!" });
});

app.listen(PORT, () => {
  console.log(`The server it's running on ${PORT}`);
});
