/**
 * File: edgeHistoryDB.js
 * Author: chuncheng.zhang
 * Purpose:
 * Play with the local Web Explorer db with sqlite3.
 * It contains web history of Edge Explorer.
 */

const fs = require("fs");
const url = require("url");
const sqlite3 = require("sqlite3");
const { ArgumentParser } = require("argparse");

const { version } = require("./package.json");

const { queries } = require("./SQLQueries");
const { saveJson, historyDBSrc, historyDBDst } = require("./pathSetup");

const parser = new ArgumentParser({
  description:
    "Read the DB of the Edge history, " + historyDBSrc + " -> " + historyDBDst,
});
parser.add_argument("--version", { action: "version", version });
parser.add_argument("-q", "--queries", {
  help: "Toggle of performing query, if not specified it will do nothing.",
  action: "store_true",
});
parser.add_argument("-a", "--all", {
  help: "Perform all queries",
  action: "store_true",
});
queries.map(({ name, short }) => {
  parser.add_argument(`-${short}`, `--${name}`, {
    help: `Get ${name} in the DB`,
    action: "store_const",
    const: name,
  });
});
const Args = parser.parse_args();

var selectQueries;
if (Args.all) {
  selectQueries = queries;
} else {
  const candidates = queries.map((d) => (Args[d.name] ? d.name : undefined));
  selectQueries = queries.filter((d) => candidates.indexOf(d.name) >= 0);
}

if (Args.queries) {
  queryOperation(selectQueries);
}

/**
 * Perform the query
 * @param {SQL query} query
 */
function queryOperation(queries) {
  fs.copyFile(historyDBSrc, historyDBDst, (err) => {
    if (err) throw err;

    const dbSession = new sqlite3.Database(historyDBDst, (err) => {
      if (err) throw err;
    });

    queries.map(({ query, name }) => {
      dbSession.all(query, (err, res) => {
        if (err) {
          // throw err;
          console.error(err, query);
          return;
        }

        // res.map(defaultTitle);
        if (name === "urls") res.map(parseUrl);

        console.log("--------");
        console.log(res);

        saveJson(res, name);

        console.log("--------");
        console.log(query);
        console.log(`Found ${res.length} entries`);
      });
    });

    dbSession.close();
  });
}

/**
 * Make the title,
 * keep it if exists,
 * else it is set as the pathname
 * e.title = pathname(e.url)
 * @param {Object} e
 */
function defaultTitle(e) {
  if (e.title) return;
  const parse = url.parse(e.url, true);
  const { pathname } = parse;
  e.title = pathname;
}

/**
 * The host and pathname is found and assigned to the object,
 * if the e.url is not string, doing nothing.
 * @param {Object} e The object with url to be parsed
 */
function parseUrl(e) {
  if (typeof e.url === "string") {
    const parse = url.parse(e.url, true);
    const { host, pathname } = parse;
    Object.assign(e, { host, pathname });
  }
}
