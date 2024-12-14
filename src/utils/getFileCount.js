async function getFileCount(directory) {
  try {
    const response = await fetch(`/api/file-count?directory=${directory}`);
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Error getting file count:", error);
    return 0;
  }
}

export default getFileCount;
