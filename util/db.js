const mysql = require("mysql");

const connection = mysql.createPool({
  host: "us-cdbr-east-06.cleardb.net",
  user: "be62820570045a",
  password: "af6180b5",
  database: "heroku_ed1b580caca1292",
});

module.exports = connection;
