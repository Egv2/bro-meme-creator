async function getFileCount(directory) {
  try {
    const response = await fetch(`/api/file-count?directory=${directory}`);
    const data = await response.json();
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
