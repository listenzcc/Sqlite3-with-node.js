const limit = 1e5;

const queries = [
  {
    name: "urls",
    short: "u",
    query: `
SELECT *
FROM urls
WHERE 1=1
AND url NOT GLOB 'http://localhost*'
AND url NOT GLOB 'file://*'
ORDER BY last_visit_time
DESC LIMIT ${limit};
`,
  },
  {
    name: "visits",
    short: "v",
    // ? It doesn't accept DESC LIMIT option, I don't know why.
    query: `
SELECT *
FROM visits
WHERE 1=1
AND url NOT GLOB 'http://localhost*'
AND url NOT GLOB 'file://*'
`,
  },
  {
    name: "tables",
    short: "t",
    query: `
SELECT name FROM sqlite_master WHERE type='table';
        `,
  },
];

module.exports = { queries };
