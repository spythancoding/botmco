const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/blacklist.json');

function lerBlacklist() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function salvarBlacklist(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  lerBlacklist,
  salvarBlacklist
};
