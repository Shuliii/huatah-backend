const express = require("express");
const path = require("path");
const connection = require("./util/db");
const cors = require("cors");

const { readFile, writeFile, getTime } = require("./util/util");
const { checkDuplicate } = require("./util/auth");

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3030;
app.use(cors());

app.get("/test", (req, res) => {
  const queryString1 = "SELECT * from userlist";

  connection.query(queryString1, (err, result) => {
    const data = result.map((item) => item.Username);
    res.json({
      message: "successful",
      data,
    });
  });
});

app.get("/user/:name", (req, res) => {
  const queryString = "SELECT * FROM userlist WHERE Username = ?";
  connection.query(queryString, [req.params.name], (err, result) => {
    if (result.length === 0) {
      res.json({
        message: "User does not exist",
      });
    } else {
      res.json({
        message: "successful",
        data: result,
      });
    }
  });
});

app.get("/users", async (req, res) => {
  const result = path.join(__dirname, "/auth.json");
  const data = await readFile(result);
  console.log(data);
  res.json({
    message: "successful",
    data,
  });
});

app.post("/users", async (req, res) => {
  const result = path.join(__dirname, "/auth.json");
  const toBeAdded = req.body;
  //do server side validation

  if (toBeAdded.username.trim().length === 0) {
    return;
  }
  console.log(await checkDuplicate(result, toBeAdded));
  if (await checkDuplicate(result, toBeAdded)) {
    return res.status(422).json({
      message: "Username is already exist.",
    });
  }

  try {
    const data = await readFile(result);

    const toBeInserted = {
      username: toBeAdded.username,
      isActive: toBeAdded.isActive,
    };
    data.users.unshift({ ...data.users[0], ...toBeInserted });
    writeFile(result, data);
    res.status(201);
    res.json({
      message: "successfully write data!",
    });
  } catch (error) {
    return error;
  }
});

app.post("/postbet", (req, res) => {
  const data = req.body;
  data.forEach(async (item) => {
    const filePath = path.join(__dirname, `/${item.type}.json`);
    console.log(filePath);
    const matchTime = await getTime(filePath, item.Match_Name);
    console.log(matchTime);
    //get time for the placed bets
    const currentDate = new Date();
    const utcTime = currentDate.getTime();
    const timeZoneOffset = 8 * 60 * 60 * 1000;
    const localtime = utcTime + timeZoneOffset;
    const localDate = new Date(localtime);
    const formattedDate = localDate
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");

    // const queryString = `INSERT INTO BETLIST (ID, Username, Bet_Time, Match_Name, Bet_Name, Amount, Odds) values (NULL, '${item.Username}', '${formattedDate}','${item.Match_Name}', '${item.Bet_Name}', ${item.Amount}, ${item.Odds})`;
    // connection.query(queryString, (err, result) => {
    //   err ? console.log(err) : console.log("successful");
    //   res.status(204);
    // });
  });
  res.json({ message: "successful" });
});

app.get("/Dota2", async (req, res) => {
  const result = path.join(__dirname, "/data/Dota2.json");
  const data = await readFile(result);
  res.json({ data });
});

app.get("/CS", async (req, res) => {
  const result = path.join(__dirname, "/data/CS.json");
  const data = await readFile(result);
  res.json({ data });
});

app.get("/NBA", async (req, res) => {
  const result = path.join(__dirname, "/data/NBA.json");
  const data = await readFile(result);
  res.json({ data });
});

app.get("/Soccer", async (req, res) => {
  const result = path.join(__dirname, "/data/Soccer.json");
  const data = await readFile(result);
  res.json({ data });
});

app.get("/Valorant", async (req, res) => {
  const result = path.join(__dirname, "/data/Valorant.json");
  const data = await readFile(result);
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`The server it's running on ${PORT}`);
});
