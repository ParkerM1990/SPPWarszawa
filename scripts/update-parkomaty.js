const fs = require("fs");
const https = require("https");

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQJ3BLePGBFMy3ocUqFgtjP4Axb2gpuQO5N7WhFCeW_j5C7_Fm3NOKid__opIUmdDY_jEKJhUwXQnx/pub?gid=0&single=true&output=csv";

console.log("🚀 START");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if ([301, 302, 307].includes(res.statusCode)) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error("HTTP " + res.statusCode));
      }

      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function parseCSV(text) {
  return text
    .replace(/^\uFEFF/, "")
    .split("\n")
    .slice(1)
    .map(l => l.split(","))
    .filter(r => r[0])
    .map(r => ({
      id: r[0]?.trim(),
      location: r[1]?.trim(),
      lng: parseFloat(r[2]),
      lat: parseFloat(r[3]),
      node: r[4]?.trim(),
      structure: r[5]?.trim()
    }));
}

(async () => {
  try {
    const csv = await fetch(CSV_URL);
    const result = parseCSV(csv);

    fs.writeFileSync("parkomaty.json", JSON.stringify(result, null, 2));

    console.log("✅ Zaktualizowano:", result.length);
  } catch (e) {
    console.error("❌ Błąd:", e.message);
  }
})();
