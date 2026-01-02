const fs = require("fs");
const path = require("path");

const ELEMENTS_DIR = path.join(__dirname, "../public/elements");
const OUTPUT_FILE = path.join(__dirname, "../public/file-manifest.json");

function generateManifest() {
  const manifest = {};

  // Her element klasörünü tara
  const directories = ["hair", "eyewear", "outfit"];

  directories.forEach((directory) => {
    const dirPath = path.join(ELEMENTS_DIR, directory);

    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dirPath}`);
      manifest[directory] = { count: 0, files: [] };
      return;
    }

    const files = fs.readdirSync(dirPath);
    const pngFiles = files.filter((file) => file.endsWith(".png"));

    // Ana dosyaları ve varyantları ayır
    const fileInfo = {};

    // Önce ana dosyaları bul
    pngFiles.forEach((file) => {
      const baseName = file.replace(".png", "");
      if (!baseName.includes("-v")) {
        fileInfo[baseName] = {
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

    // Manifest formatına dönüştür
    manifest[directory] = {
      count: Object.keys(fileInfo).length,
      files: Object.entries(fileInfo).map(([file, info]) => ({
        file,
        variantCount: info.variants.length > 0 ? Math.max(...info.variants) : 0,
      })),
    };

    console.log(`${directory}: ${manifest[directory].count} files found`);
  });

  // JSON dosyasına yaz
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest generated: ${OUTPUT_FILE}`);
}

generateManifest();
