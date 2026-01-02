import React, { useState, useEffect } from "react";
import styles from "./Character.module.css";

function Character({
  hair,
  eyewear,
  outfit,
  hairVariant,
  eyewearVariant,
  outfitVariant,
  body,
  head,
  face,
  accessory,
  skinColor,
  clothesColor,
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

  return (
    <div className={styles.characterContainer}>
      <img
        src="/elements/base/base-body.png"
        alt="Base body"
        className={styles.baseLayer}
      />
      {hair >= 0 && hairLoaded && (
        <img
          src={hairSrc}
          alt={`Hair style ${hair}`}
          className={styles.layer}
          onError={() => setHairLoaded(false)}
        />
      )}
      {eyewear >= 0 && eyewearLoaded && (
        <img
          src={eyewearSrc}
          alt={`Eyewear style ${eyewear}`}
          className={styles.layer}
          onError={() => setEyewearLoaded(false)}
        />
      )}
      {outfit >= 0 && outfitLoaded && (
        <img
          src={outfitSrc}
          alt={`Outfit style ${outfit}`}
          className={styles.layer}
          onError={() => setOutfitLoaded(false)}
        />
      )}
    </div>
  );
}

export default Character;
