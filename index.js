const express = require("express");
const path = require("path");
const connection = require("./util/db");
const cors = require("cors");

const {
  readFile,
  writeFile,
  getTime,
  formatDate,
  filterData,
} = require("./util/util");
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

app.get("/active/:name", (req, res) => {
  const queryString =
    "SELECT * FROM betlist WHERE Username = ? and Balance is NULL";
  connection.query(queryString, [req.params.name], (err, result) => {
    if (result.length === 0) {
      res.json({
        message: "No Active Bets",
      });
    } else {
      res.json({
        message: "successful",
        data: result,
      });
    }
  });
});

app.get("/summary/:name", (req, res) => {
  const queryString =
    "SELECT * FROM betlist where Username = ? and Balance is not NULL order by id desc limit ?;";
  connection.query(queryString, [req.params.name, 25], (err, result) => {
    if (result.length === 0) {
      res.json({
        message: "No History Bets",
      });
    } else {
      res.json({
        message: "successful",
        data: result,
      });
    }
  });
});

app.get("/balance/:name", (req, res) => {
  const queryString =
    "SELECT SUM(Balance) as balance FROM betlist WHERE Username = ?";
  connection.query(queryString, [req.params.name], (err, result) => {
    if (result.length === 0) {
      res.json({
        message: "No History Bets",
      });
    } else {
      res.json({
        message: "successful",
        data: result,
      });
    }
  });
});

app.post("/postbet", async (req, res) => {
  const data = req.body;
  console.log(data);
  let response = [];

  try {
    await Promise.all(
      data.map(async (item) => {
        // get match time
        const filePath = path.join(__dirname, `/data/${item.Type}.json`);
        const matchTime = await getTime(filePath, item.Match_Name);

        // get bet time and format bet time
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);

        // check if bet time > match time
        const formattedMatchTime = new Date(matchTime);
        const sqlFormatMatchTime = formatDate(formattedMatchTime);

        if (formattedMatchTime - currentDate > 0) {
          const queryString = `INSERT INTO BETLIST (ID, Username, Bet_Time, Match_Time, Match_Name, Bet_Name, Amount, Odds) values (NULL, '${item.Username}', '${formattedDate}','${sqlFormatMatchTime}','${item.Match_Name}', '${item.Bet_Name}', ${item.Amount}, ${item.Odds})`;

          // Use a promise wrapper for the query
          const queryPromise = new Promise((resolve, reject) => {
            connection.query(queryString, (err, result) => {
              if (err) {
                console.log(err);
                response.push({ message: "unsuccessful" });
                reject(err);
              } else {
                response.push({ message: "successful" });
                resolve(result);
              }
            });
          });

          // Wait for the query to complete
          await queryPromise;
        } else {
          response.push({ message: "unsuccessful" });
        }
      })
    );

    res.json({ response });
  } catch (error) {
    console.error("Error processing requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Dota2", async (req, res) => {
  const result = path.join(__dirname, "/data/Dota2.json");
  const data = await readFile(result);
  const filteredData = filterData(data);
  res.json({ data: filteredData });
  // res.json({ data });
});

app.get("/CS", async (req, res) => {
  const result = path.join(__dirname, "/data/CS.json");
  const data = await readFile(result);
  const filteredData = filterData(data);
  res.json({ data: filteredData });
  // res.json({ data });
});

app.get("/NBA", async (req, res) => {
  const result = path.join(__dirname, "/data/NBA.json");
  const data = await readFile(result);
  const filteredData = filterData(data);
  res.json({ data: filteredData });
  // res.json({ data });
});

app.get("/Soccer", async (req, res) => {
  const result = path.join(__dirname, "/data/Soccer.json");
  const data = await readFile(result);
  const filteredData = filterData(data);
  res.json({ data: filteredData });
  // res.json({ data });
});

app.get("/Valorant", async (req, res) => {
  const result = path.join(__dirname, "/data/Valorant.json");
  const data = await readFile(result);
  const filteredData = filterData(data);
  res.json({ data: filteredData });
  // res.json({ data });
});

// app.delete("/delete/:id", (req, res) => {
//   console.log(req.params.id);
//   const queryString = `SELECT * FROM betlist WHERE id = ${req.params.id}`;
//   let data;
//   connection.query(queryString, (err, result) => {
//     if (result.length === 0) {
//       res.json({
//         message: "Bet List does not exist",
//       });
//     } else {
//       data = result;
//     }
//   });

//   console.log(data);

//   const currentDate = new Date();
//   const matchDate = new Date(data.Match_Time);

//   if (matchDate - currentDate > 0) {
//     const deleteQueryString = `DELETE FROM betlist where id = ${req.params.id}`;
//     connection.query(deleteQueryString, (err, result) => {
//       if (err) throw err;
//       res.json({
//         message: "Successfully delete the bet",
//       });
//     });
//   }
// });

app.delete("/delete/:id", (req, res) => {
  console.log(req.params.id);
  const queryString = `SELECT * FROM betlist WHERE id = ${req.params.id}`;

  connection.query(queryString, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }

    if (result.length === 0) {
      res.json({
        message: "Bet List does not exist",
      });
    } else {
      const data = result;

      const currentDate = new Date();
      const matchDate = new Date(data[0].Match_Time); // Assuming Match_Time is a property in the result

      if (matchDate - currentDate > 0) {
        const deleteQueryString = `DELETE FROM betlist where id = ${req.params.id}`;
        connection.query(deleteQueryString, (err, result) => {
          if (err) {
            res.status(500).json({ message: "Internal Server Error" });
            return;
          }
          res.json({
            message: "Successfully deleted the bet",
          });
        });
      } else {
        res.json({
          message: "Cannot delete bet, match has already started",
        });
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`The server it's running on ${PORT}`);
});
