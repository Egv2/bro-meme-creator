import React, { useState, useEffect } from "react";
import styles from "./Character.module.css";

function Character({
  hair,
  eyewear,
  outfit,
  hairVariant,
  eyewearVariant,
  outfitVariant,
  direction = "next",
}) {
  // Görsel yükleme durumlarını takip et
  const [hairLoaded, setHairLoaded] = useState(true);
  const [eyewearLoaded, setEyewearLoaded] = useState(true);
  const [outfitLoaded, setOutfitLoaded] = useState(true);

  // Görsel URL'leri
  const hairSrc = `/elements/hair/hair-${hair + 1}${
    hairVariant > 0 ? `-v${hairVariant + 1}` : ""
  }.png`;
  const eyewearSrc = `/elements/eyewear/eyewear-${eyewear + 1}${
    eyewearVariant > 0 ? `-v${eyewearVariant + 1}` : ""
  }.png`;
  const outfitSrc = `/elements/outfit/outfit-${outfit + 1}${
    outfitVariant > 0 ? `-v${outfitVariant + 1}` : ""
  }.png`;

  // URL değiştiğinde loaded state'lerini sıfırla
  useEffect(() => {
    setHairLoaded(true);
  }, [hairSrc]);

  useEffect(() => {
    setEyewearLoaded(true);
  }, [eyewearSrc]);

  useEffect(() => {
    setOutfitLoaded(true);
  }, [outfitSrc]);

  // Kayma yönüne göre animasyon sınıfı; key={src} remount'u tetikler
  const layerAnimClass =
    direction === "prev" ? styles.layerSlidePrev : styles.layerSlideNext;

  return (
    <div className={styles.characterContainer}>
      <img
        src="/elements/base/base-body.png"
        alt="Base body"
        className={styles.baseLayer}
      />
      {hair >= 0 && hairLoaded && (
        <img
          key={hairSrc}
          src={hairSrc}
          alt={`Hair style ${hair}`}
          className={`${styles.layer} ${layerAnimClass}`}
          onError={() => setHairLoaded(false)}
        />
      )}
      {eyewear >= 0 && eyewearLoaded && (
        <img
          key={eyewearSrc}
          src={eyewearSrc}
          alt={`Eyewear style ${eyewear}`}
          className={`${styles.layer} ${layerAnimClass}`}
          onError={() => setEyewearLoaded(false)}
        />
      )}
      {outfit >= 0 && outfitLoaded && (
        <img
          key={outfitSrc}
          src={outfitSrc}
          alt={`Outfit style ${outfit}`}
          className={`${styles.layer} ${layerAnimClass}`}
          onError={() => setOutfitLoaded(false)}
        />
      )}
    </div>
  );
}

export default Character;
