const fs = require("fs");
const path = require("path");

app.get("/api/file-count", (req, res) => {
  const directory = req.query.directory;
  const dirPath = path.join(__dirname, "../../public/elements", directory);

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const pngFiles = files.filter((file) => file.endsWith(".png"));
    res.json({ count: pngFiles.length });
  });
});
