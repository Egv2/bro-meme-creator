// Cache for manifest data
let manifestCache = null;

async function loadManifest() {
  if (manifestCache) return manifestCache;

  try {
    const response = await fetch("/file-manifest.json");
    manifestCache = await response.json();
    return manifestCache;
  } catch (error) {
    console.error("Error loading manifest:", error);
    return null;
  }
}

async function getFileCount(directory) {
  try {
    const manifest = await loadManifest();

    if (!manifest || !manifest[directory]) {
      console.warn(`No manifest data for directory: ${directory}`);
      return {
        count: 0,
        variants: [],
      };
    }

    const data = manifest[directory];
    return {
      count: data.count,
      variants: data.files.map((file) => ({
        file: file.file,
        variantCount: file.variantCount,
      })),
    };
  } catch (error) {
    console.error("Error getting file count:", error);
    return {
      count: 0,
      variants: [],
    };
  }
}

export default getFileCount;
