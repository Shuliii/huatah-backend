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
    const fileContent = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);
    const filteredData = jsonData
      .filter((item) => item.match_name === Match_Name)
      .map((item) => item.time);
    return filteredData[0];
  } catch (error) {
    console.error("Error occured when trying to extract time");
  }
}

// function formatDate(datetime) {
//   const utcTime = datetime.getTime();
//   const timeZoneOffset = 8 * 60 * 60 * 1000;
//   const localtime = utcTime + timeZoneOffset;
//   const localDate = new Date(localtime);
//   const formattedDate = localDate
//     .toISOString()
//     .replace(/T/, " ")
//     .replace(/\..+/, "");

//   return formattedDate;
// }

function formatDate(datetime) {
  const localDate = new Date(datetime);
  localDate.setUTCHours(localDate.getUTCHours() + 8);

  const formattedDate = localDate
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");

  return formattedDate;
}

function filterData(data) {
  const now = new Date();
  const filteredData = data.filter((item) => {
    const matchTime = new Date(item.time);
    return matchTime - now > 0;
  });

  return filteredData;
}

exports.filterData = filterData;
exports.formatDate = formatDate;
exports.getTime = getTime;
exports.readFile = readFile;
exports.writeFile = writeFile;
