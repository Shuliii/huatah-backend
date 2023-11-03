const express = require("express");

const app = express();

const PORT = 3030;

app.get("/test", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`The server it's running on ${PORT}`);
});
