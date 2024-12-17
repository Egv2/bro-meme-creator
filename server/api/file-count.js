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

    // Ana dosyaları ve varyantları ayır
    const fileInfo = {};

    // Önce ana dosyaları bul
    pngFiles.forEach((file) => {
      const baseName = file.replace(".png", "");
      if (!baseName.includes("-v")) {
        const baseFile = baseName;
        fileInfo[baseFile] = {
          variants: [],
        };
      }
    });

    // Sonra varyantları bul
    pngFiles.forEach((file) => {
      const baseName = file.replace(".png", "");
      if (baseName.includes("-v")) {
        const [baseFile, variant] = baseName.split("-v");
        if (fileInfo[baseFile]) {
          fileInfo[baseFile].variants.push(parseInt(variant));
        }
      }
    });

    // Her dosya için maksimum varyant sayısını bul
    const result = {
      count: Object.keys(fileInfo).length,
      files: Object.entries(fileInfo).map(([file, info]) => ({
        file,
        variantCount: info.variants.length > 0 ? Math.max(...info.variants) : 0,
      })),
    };

    console.log("API Response:", result);
    res.json(result);
  });
});
