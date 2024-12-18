import React from "react";
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
  console.log("Current values:", {
    hair,
    eyewear,
    outfit,
    hairVariant,
    eyewearVariant,
    outfitVariant,
  });

  return (
    <div className={styles.characterContainer}>
      <img
        src="/elements/base/base-body.png"
        alt="Base body"
        className={styles.baseLayer}
        onError={(e) => console.log("Base image error:", e)}
      />
      {hair >= 0 && (
        <img
          src={`/elements/hair/hair-${hair + 1}${
            hairVariant > 0 ? `-v${hairVariant + 1}` : ""
          }.png`}
          alt={`Hair style ${hair}`}
          className={styles.layer}
          onError={(e) => console.log("Hair image error:", e)}
        />
      )}
      {eyewear >= 0 && (
        <img
          src={`/elements/eyewear/eyewear-${eyewear + 1}${
            eyewearVariant > 0 ? `-v${eyewearVariant + 1}` : ""
          }.png`}
          alt={`Eyewear style ${eyewear}`}
          className={styles.layer}
          onError={(e) => console.log("Eyewear image error:", e)}
        />
      )}
      {outfit >= 0 && (
        <img
          src={`/elements/outfit/outfit-${outfit + 1}${
            outfitVariant > 0 ? `-v${outfitVariant + 1}` : ""
          }.png`}
          alt={`Outfit style ${outfit}`}
          className={styles.layer}
          onError={(e) => console.log("Outfit image error:", e)}
        />
      )}
    </div>
  );
}

export default Character;
