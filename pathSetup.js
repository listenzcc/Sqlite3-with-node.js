const fs = require("fs");
const path = require("path");

const db_folder = path.join(
    process.env["LOCALAPPDATA"],
    "Microsoft\\Edge\\User Data\\Default"
  ),
  historyDBSrc = path.join(db_folder, "history"),
  historyDBDst = path.join(db_folder, "history-latest.db"),
  outputFolder = path.join("json");

fs.mkdir(outputFolder, () => {});

/**
 * The data is saved to the dst as the json file
 * @param {String} data The data to be JSON stringified.
 * @param {String} name The file name of the destination .json file
 */
function saveJson(data, name) {
  const json = JSON.stringify(data);

  name += name.endsWith(".json") ? "" : ".json";
  const dstPath = path.join(outputFolder, name);

  fs.writeFile(dstPath, json, (err) => {
    if (err) {
      throw err;
    }
    console.log(`JSON data is saved in ${dstPath}.`);
  });
}

module.exports = { saveJson, historyDBSrc, historyDBDst };
