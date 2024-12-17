import React, { useEffect } from "react";
import getFileCount from "../../utils/getFileCount";

import {
  numBodies,
  numHeads,
  numFaces,
  numAccessories,
  clothesColors,
  defaultSkinColor,
  defaultClothesColor,
  numBase,
  numHair,
  numEyewear,
  numOutfit,
  defaultHair,
  defaultEyewear,
  defaultOutfit,
} from "../../constants";
import Character from "../Character";
import MaxWidthWrapper from "../MaxWidthWrapper";
import ControlPane from "../ControlPane";
import ToggleButton from "../ToggleButton";
import ItemSelector from "../ItemSelector";

import {
  bodyOptions,
  headOptions,
  faceOptions,
  accessoryOptions,
  skinColorOptions,
  clothesColorOptions,
} from "./CharacterEditor.helpers";
import styles from "./CharacterEditor.module.css";

function CharacterEditor() {
  const [body, setBody] = React.useState(0);
  const [head, setHead] = React.useState(0);
  const [face, setFace] = React.useState(0);
  const [accessory, setAccessory] = React.useState(0);
  const [skinColor, setSkinColor] = React.useState(defaultSkinColor);
  const [clothesColor, setClothesColor] = React.useState(defaultClothesColor);
  const [hair, setHair] = React.useState(defaultHair);
  const [eyewear, setEyewear] = React.useState(defaultEyewear);
  const [outfit, setOutfit] = React.useState(defaultOutfit);

  // Varyasyon state'leri
  const [hairVariants, setHairVariants] = React.useState({});
  const [eyewearVariants, setEyewearVariants] = React.useState({});
  const [outfitVariants, setOutfitVariants] = React.useState({});

  // Dropdown state'leri
  const [openHairVariant, setOpenHairVariant] = React.useState(false);
  const [openEyewearVariant, setOpenEyewearVariant] = React.useState(false);
  const [openOutfitVariant, setOpenOutfitVariant] = React.useState(false);

  // Dosya sayıları
  const [numHairFiles, setNumHairFiles] = React.useState(0);
  const [numEyewearFiles, setNumEyewearFiles] = React.useState(0);
  const [numOutfitFiles, setNumOutfitFiles] = React.useState(0);

  // Her aksesuar için varyasyon sayısı
  const [variantCounts, setVariantCounts] = React.useState({
    hair: [],
    eyewear: [],
    outfit: [],
  });

  useEffect(() => {
    async function fetchFileCounts() {
      const hairData = await getFileCount("hair");
      const eyewearData = await getFileCount("eyewear");
      const outfitData = await getFileCount("outfit");

      setNumHairFiles(hairData.count);
      setNumEyewearFiles(eyewearData.count);
      setNumOutfitFiles(outfitData.count);

      setVariantCounts({
        hair: hairData.variants,
        eyewear: eyewearData.variants,
        outfit: outfitData.variants,
      });

      // Her element için varsayılan varyant state'lerini oluştur
      const initialHairVariants = {};
      const initialEyewearVariants = {};
      const initialOutfitVariants = {};

      // Her dosya için varyant state'i oluştur
      hairData.variants.forEach((variant) => {
        const fileNumber = parseInt(variant.file.split("-")[1]) - 1;
        initialHairVariants[fileNumber] = 0;
      });

      eyewearData.variants.forEach((variant) => {
        const fileNumber = parseInt(variant.file.split("-")[1]) - 1;
        initialEyewearVariants[fileNumber] = 0;
      });

      outfitData.variants.forEach((variant) => {
        const fileNumber = parseInt(variant.file.split("-")[1]) - 1;
        initialOutfitVariants[fileNumber] = 0;
      });

      setHairVariants(initialHairVariants);
      setEyewearVariants(initialEyewearVariants);
      setOutfitVariants(initialOutfitVariants);

      console.log("Variant counts:", {
        hair: hairData.variants,
        eyewear: eyewearData.variants,
        outfit: outfitData.variants,
      });
    }

    fetchFileCounts();
  }, []);

  // Seçili öğe için variant sayısını al
  const getVariantCount = (type, index) => {
    const variants = variantCounts[type];
    console.log(`Checking variants for ${type}-${index + 1}:`, variants);

    if (!variants) return 0;

    // Dosya adını oluştur (örn: "hair-1", "eyewear-1", "outfit-1")
    const fileName = `${type}-${index + 1}`;
    console.log("Looking for file:", fileName);

    // Bu dosya adına sahip varyantı bul
    const fileVariant = variants.find((v) => v.file === fileName);
    console.log("Found variant:", fileVariant);

    return fileVariant ? fileVariant.variantCount : 0;
  };

  // Her element türü için ayrı variant değişiklik fonksiyonları
  const handleHairVariantChange = (newValue) => {
    setHairVariants((prev) => ({
      ...prev,
      [hair]: newValue,
    }));
  };

  const handleEyewearVariantChange = (newValue) => {
    setEyewearVariants((prev) => ({
      ...prev,
      [eyewear]: newValue,
    }));
  };

  const handleOutfitVariantChange = (newValue) => {
    setOutfitVariants((prev) => ({
      ...prev,
      [outfit]: newValue,
    }));
  };

  const handleRandomize = () => {
    setBody(Math.floor(Math.random() * numBodies));
    setHead(Math.floor(Math.random() * numHeads));
    setFace(Math.floor(Math.random() * numFaces));
    setAccessory(Math.floor(Math.random() * numAccessories));
    setClothesColor(
      clothesColors[Math.floor(Math.random() * clothesColors.length)].color
    );
  };

  const handlePrevious = (setter, currentValue, maxValue) => {
    setter(currentValue === 0 ? maxValue - 1 : currentValue - 1);
  };

  const handleNext = (setter, currentValue, maxValue) => {
    setter(currentValue === maxValue - 1 ? 0 : currentValue + 1);
  };

  const handleDownload = () => {
    const characterWrapper = document.querySelector(
      `.${styles.characterWrapper}`
    );
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Canvas boyutunu ayarla
    canvas.width = 800;
    canvas.height = 800;

    // Tüm görselleri yükle ve canvas'a çiz
    const images = characterWrapper.querySelectorAll("img");
    let loadedImages = 0;

    const drawImages = () => {
      images.forEach((img) => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      });

      // Canvas'ı PNG olarak indir
      const link = document.createElement("a");
      link.download = "my-bro.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    images.forEach((img) => {
      const newImg = new Image();
      newImg.crossOrigin = "Anonymous";
      newImg.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          drawImages();
        }
      };
      newImg.src = img.src;
    });
  };

  return (
    <main className={styles.characterEditor}>
      <MaxWidthWrapper className={styles.maxWidthWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            $BRO CREATOR <span style={{ fontSize: "smaller" }}>(BETA)</span>
          </h1>
          <p className={styles.description}>
            Use the controller below to customize your $BRO.{" "}
          </p>
        </header>

        <div className={styles.controlColumn}>
          <div className={styles.accessorySection}>
            <ItemSelector
              title="Hair"
              current={hair}
              total={numHairFiles}
              onPrevious={() => handlePrevious(setHair, hair, numHairFiles)}
              onNext={() => handleNext(setHair, hair, numHairFiles)}
            />
            <div className={styles.variantWrapper}>
              <button
                className={styles.variantToggle}
                onClick={() => setOpenHairVariant(!openHairVariant)}
              >
                Variants ▼
              </button>
              {openHairVariant && (
                <div className={styles.variantControls}>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handlePrevious(
                        handleHairVariantChange,
                        hairVariants[hair] || 0,
                        getVariantCount("hair", hair)
                      )
                    }
                  >
                    ◀
                  </button>
                  <span className={styles.variantCount}>
                    Variant {hairVariants[hair] + 1}
                  </span>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handleNext(
                        handleHairVariantChange,
                        hairVariants[hair] || 0,
                        getVariantCount("hair", hair)
                      )
                    }
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.accessorySection}>
            <ItemSelector
              title="Eyewear"
              current={eyewear}
              total={numEyewearFiles}
              onPrevious={() =>
                handlePrevious(setEyewear, eyewear, numEyewearFiles)
              }
              onNext={() => handleNext(setEyewear, eyewear, numEyewearFiles)}
            />
            <div className={styles.variantWrapper}>
              <button
                className={styles.variantToggle}
                onClick={() => setOpenEyewearVariant(!openEyewearVariant)}
              >
                Variants ▼
              </button>
              {openEyewearVariant && (
                <div className={styles.variantControls}>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handlePrevious(
                        handleEyewearVariantChange,
                        eyewearVariants[eyewear] || 0,
                        getVariantCount("eyewear", eyewear)
                      )
                    }
                  >
                    ◀
                  </button>
                  <span className={styles.variantCount}>
                    Variant {eyewearVariants[eyewear] + 1}
                  </span>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handleNext(
                        handleEyewearVariantChange,
                        eyewearVariants[eyewear] || 0,
                        getVariantCount("eyewear", eyewear)
                      )
                    }
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.accessorySection}>
            <ItemSelector
              title="Outfit"
              current={outfit}
              total={numOutfitFiles}
              onPrevious={() =>
                handlePrevious(setOutfit, outfit, numOutfitFiles)
              }
              onNext={() => handleNext(setOutfit, outfit, numOutfitFiles)}
            />
            <div className={styles.variantWrapper}>
              <button
                className={styles.variantToggle}
                onClick={() => setOpenOutfitVariant(!openOutfitVariant)}
              >
                Variants ▼
              </button>
              {openOutfitVariant && (
                <div className={styles.variantControls}>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handlePrevious(
                        handleOutfitVariantChange,
                        outfitVariants[outfit] || 0,
                        getVariantCount("outfit", outfit)
                      )
                    }
                  >
                    ◀
                  </button>
                  <span className={styles.variantCount}>
                    Variant {outfitVariants[outfit] + 1}
                  </span>
                  <button
                    className={styles.variantButton}
                    onClick={() =>
                      handleNext(
                        handleOutfitVariantChange,
                        outfitVariants[outfit] || 0,
                        getVariantCount("outfit", outfit)
                      )
                    }
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      <div className={styles.characterWrapper}>
        <div className={styles.previewSection}>
          <h2 className={styles.previewTitle}>Preview</h2>
          <Character
            body={body}
            head={head}
            face={face}
            accessory={accessory}
            skinColor={skinColor}
            clothesColor={clothesColor}
            hair={hair}
            eyewear={eyewear}
            outfit={outfit}
            hairVariant={hairVariants[hair] || 0}
            eyewearVariant={eyewearVariants[eyewear] || 0}
            outfitVariant={outfitVariants[outfit] || 0}
          />
          <button onClick={handleDownload} className={styles.downloadButton}>
            Download $BRO
          </button>
        </div>
      </div>
    </main>
  );
}

export default CharacterEditor;
