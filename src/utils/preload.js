export function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export async function preloadImages(urls, onProgress) {
  let loaded = 0;
  const total = urls.length;

  await Promise.all(
    urls.map((url) =>
      preloadImage(url).then(() => {
        loaded += 1;
        if (onProgress) onProgress(loaded, total);
      })
    )
  );
}
