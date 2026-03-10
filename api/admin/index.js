// api/admin/index.js — serves the admin dashboard
const fs   = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  const html = fs.readFileSync(path.join(process.cwd(), "public", "admin.html"), "utf8");
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};