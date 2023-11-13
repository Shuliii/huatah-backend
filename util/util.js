const fs = require("fs").promises;

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function writeFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function getTime(filePath, Match_Name) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const filteredData = await data
      .filter((item) => item.match_name === Match_Name)
      .map((item) => item.time);
    return JSON.parse(filteredData);
  } catch (error) {
    console.error("Error occured when trying to extract time");
  }
}

exports.getTime = getTime;
exports.readFile = readFile;
exports.writeFile = writeFile;
