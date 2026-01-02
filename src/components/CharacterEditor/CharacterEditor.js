import React, { useEffect } from "react";
import {
  Scissors,
  Eyeglasses,
  TShirt,
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,
  DownloadSimple,
  Shuffle,
} from "@phosphor-icons/react";
import getFileCount from "../../utils/getFileCount";

import {
  clothesColors,
  skinColors,
  defaultSkinColor,
  defaultClothesColor,
  defaultHair,
  defaultEyewear,
  defaultOutfit,
} from "../../constants";
import Character from "../Character";
import MaxWidthWrapper from "../MaxWidthWrapper";
import ItemSelector from "../ItemSelector";
import TabNavigation from "../TabNavigation";

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

  // Tab state
  const [activeTab, setActiveTab] = React.useState("hair");

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
    }

    fetchFileCounts();
  }, []);

  // Seçili öğe için variant sayısını al
  const getVariantCount = (type, index) => {
    const variants = variantCounts[type];

    if (!variants) return 0;

    // Dosya adını oluştur (örn: "hair-1", "eyewear-1", "outfit-1")
    const fileName = `${type}-${index + 1}`;

    // Bu dosya adına sahip varyantı bul
    const fileVariant = variants.find((v) => v.file === fileName);

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
    // Manifest'ten gelen dinamik dosya sayılarını kullan
    const hairCount = numHairFiles > 0 ? numHairFiles : 1;
    const eyewearCount = numEyewearFiles > 0 ? numEyewearFiles : 1;
    const outfitCount = numOutfitFiles > 0 ? numOutfitFiles : 1;

    const newHair = Math.floor(Math.random() * hairCount);
    const newEyewear = Math.floor(Math.random() * eyewearCount);
    const newOutfit = Math.floor(Math.random() * outfitCount);

    // Her bileşen için gerçek varyant sayısına göre rastgele varyant seç
    const hairVariantCount = getVariantCount("hair", newHair);
    const eyewearVariantCount = getVariantCount("eyewear", newEyewear);
    const outfitVariantCount = getVariantCount("outfit", newOutfit);

    const newHairVariant =
      hairVariantCount > 0
        ? Math.floor(Math.random() * (hairVariantCount + 1))
        : 0;
    const newEyewearVariant =
      eyewearVariantCount > 0
        ? Math.floor(Math.random() * (eyewearVariantCount + 1))
        : 0;
    const newOutfitVariant =
      outfitVariantCount > 0
        ? Math.floor(Math.random() * (outfitVariantCount + 1))
        : 0;

    // State'leri güncelle
    setHair(newHair);
    setEyewear(newEyewear);
    setOutfit(newOutfit);

    // Varyantları güncelle
    setHairVariants((prev) => ({ ...prev, [newHair]: newHairVariant }));
    setEyewearVariants((prev) => ({
      ...prev,
      [newEyewear]: newEyewearVariant,
    }));
    setOutfitVariants((prev) => ({ ...prev, [newOutfit]: newOutfitVariant }));
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

  // Tab konfigürasyonu
  const tabs = [
    { id: "hair", label: "Hair", icon: <Scissors size={24} weight="bold" /> },
    {
      id: "eyewear",
      label: "Eyewear",
      icon: <Eyeglasses size={24} weight="bold" />,
    },
    { id: "outfit", label: "Outfit", icon: <TShirt size={24} weight="bold" /> },
  ];

  // Aktif tab'ın içeriğini render et
  const renderTabContent = () => {
    switch (activeTab) {
      case "hair":
        return (
          <div className={styles.tabContent}>
            <ItemSelector
              title="Hair Style"
              current={hair}
              total={numHairFiles}
              onPrevious={() => handlePrevious(setHair, hair, numHairFiles)}
              onNext={() => handleNext(setHair, hair, numHairFiles)}
            />
            {getVariantCount("hair", hair) > 0 && (
              <div className={styles.variantWrapper}>
                <button
                  className={styles.variantToggle}
                  onClick={() => setOpenHairVariant(!openHairVariant)}
                >
                  {openHairVariant ? (
                    <>
                      Hide Variants{" "}
                      <CaretUp
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  ) : (
                    <>
                      Show Variants{" "}
                      <CaretDown
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  )}
                </button>
                {openHairVariant && (
                  <div className={styles.variantControls}>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handlePrevious(
                          handleHairVariantChange,
                          hairVariants[hair] || 0,
                          getVariantCount("hair", hair) + 1
                        )
                      }
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                    <span className={styles.variantCount}>
                      Variant {(hairVariants[hair] || 0) + 1} /{" "}
                      {getVariantCount("hair", hair) + 1}
                    </span>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handleNext(
                          handleHairVariantChange,
                          hairVariants[hair] || 0,
                          getVariantCount("hair", hair) + 1
                        )
                      }
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "eyewear":
        return (
          <div className={styles.tabContent}>
            <ItemSelector
              title="Eyewear Style"
              current={eyewear}
              total={numEyewearFiles}
              onPrevious={() =>
                handlePrevious(setEyewear, eyewear, numEyewearFiles)
              }
              onNext={() => handleNext(setEyewear, eyewear, numEyewearFiles)}
            />
            {getVariantCount("eyewear", eyewear) > 0 && (
              <div className={styles.variantWrapper}>
                <button
                  className={styles.variantToggle}
                  onClick={() => setOpenEyewearVariant(!openEyewearVariant)}
                >
                  {openEyewearVariant ? (
                    <>
                      Hide Variants{" "}
                      <CaretUp
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  ) : (
                    <>
                      Show Variants{" "}
                      <CaretDown
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  )}
                </button>
                {openEyewearVariant && (
                  <div className={styles.variantControls}>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handlePrevious(
                          handleEyewearVariantChange,
                          eyewearVariants[eyewear] || 0,
                          getVariantCount("eyewear", eyewear) + 1
                        )
                      }
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                    <span className={styles.variantCount}>
                      Variant {(eyewearVariants[eyewear] || 0) + 1} /{" "}
                      {getVariantCount("eyewear", eyewear) + 1}
                    </span>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handleNext(
                          handleEyewearVariantChange,
                          eyewearVariants[eyewear] || 0,
                          getVariantCount("eyewear", eyewear) + 1
                        )
                      }
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "outfit":
        return (
          <div className={styles.tabContent}>
            <ItemSelector
              title="Outfit Style"
              current={outfit}
              total={numOutfitFiles}
              onPrevious={() =>
                handlePrevious(setOutfit, outfit, numOutfitFiles)
              }
              onNext={() => handleNext(setOutfit, outfit, numOutfitFiles)}
            />
            {getVariantCount("outfit", outfit) > 0 && (
              <div className={styles.variantWrapper}>
                <button
                  className={styles.variantToggle}
                  onClick={() => setOpenOutfitVariant(!openOutfitVariant)}
                >
                  {openOutfitVariant ? (
                    <>
                      Hide Variants{" "}
                      <CaretUp
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  ) : (
                    <>
                      Show Variants{" "}
                      <CaretDown
                        size={18}
                        weight="bold"
                        style={{ marginLeft: "8px" }}
                      />
                    </>
                  )}
                </button>
                {openOutfitVariant && (
                  <div className={styles.variantControls}>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handlePrevious(
                          handleOutfitVariantChange,
                          outfitVariants[outfit] || 0,
                          getVariantCount("outfit", outfit) + 1
                        )
                      }
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                    <span className={styles.variantCount}>
                      Variant {(outfitVariants[outfit] || 0) + 1} /{" "}
                      {getVariantCount("outfit", outfit) + 1}
                    </span>
                    <button
                      className={styles.variantButton}
                      onClick={() =>
                        handleNext(
                          handleOutfitVariantChange,
                          outfitVariants[outfit] || 0,
                          getVariantCount("outfit", outfit) + 1
                        )
                      }
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className={styles.characterEditor}>
      <MaxWidthWrapper className={styles.maxWidthWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            $BRO CREATOR <span style={{ fontSize: "smaller" }}>(BETA)</span>
          </h1>
          <p className={styles.description}>
            Use the tabs below to customize your $BRO.
          </p>
        </header>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className={styles.controlColumn}>{renderTabContent()}</div>
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
          <div className={styles.buttonRow}>
            <button
              onClick={handleRandomize}
              className={styles.randomizeButton}
            >
              <Shuffle
                size={20}
                weight="bold"
                style={{ letterSpacing: "2px", marginRight: "8px" }}
              />
              Randomize $BRO
            </button>
            <button onClick={handleDownload} className={styles.downloadButton}>
              <DownloadSimple
                size={20}
                weight="bold"
                style={{ marginRight: "8px" }}
              />
              Download $BRO
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CharacterEditor;
