const { readFile } = require("./util");

async function checkDuplicate(filePath, toBeChecked) {
  const data = await readFile(filePath);

  const filteredData = data.users.filter(
    (item) => item.username === toBeChecked.username
  );

  console.log(filteredData);
  if (filteredData.length === 0) {
    return false;
  } else {
    return true;
  }
}

exports.checkDuplicate = checkDuplicate;
