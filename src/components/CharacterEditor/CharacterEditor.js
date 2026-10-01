import React, { useEffect } from "react";
import { unstable_batchedUpdates } from "react-dom";
import anime from "animejs";
import {
  HairIcon,
  GlassesIcon,
  ShirtIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RandomizeIcon,
  DownloadIcon,
} from "../icons";
import { preloadImages } from "../../utils/preload";
import getFileCount from "../../utils/getFileCount";

import { defaultHair, defaultEyewear, defaultOutfit } from "../../constants";
import Character from "../Character";
import ItemSelector from "../ItemSelector";
import { TILE_SPIN_CELLS } from "../ItemSelector/spinConfig";
import TabNavigation from "../TabNavigation";
import Preloader from "../Preloader";

import styles from "./CharacterEditor.module.css";

function VariantChevron({ flipped }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className={flipped ? styles.chevronFlipped : styles.chevron}
    >
      <path
        d="M3 5.5l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CharacterEditor() {
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

  // Preloader durumu
  const [preloadProgress, setPreloadProgress] = React.useState(0);
  const [preloadDone, setPreloadDone] = React.useState(false);

  // Randomize slot animasyonu ve geçiş yönü
  const [shuffling, setShuffling] = React.useState(false);
  const [direction, setDirection] = React.useState("next");
  const shuffleRunningRef = React.useRef(false);

  // Slot planı ve reveal pop için DOM referansı
  const [spinPlan, setSpinPlan] = React.useState(null);
  const characterBoxRef = React.useRef(null);

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

      // Kritik görselleri önden yükle: base body + her item'in ana hali.
      // Preloader bunlar bitene kadar ekranda kalır, böylece geçişlerde pop-in olmaz.
      const criticalUrls = ["/elements/base/base-body.png"];
      [
        ["hair", hairData.count],
        ["eyewear", eyewearData.count],
        ["outfit", outfitData.count],
      ].forEach(([type, count]) => {
        for (let i = 1; i <= count; i += 1) {
          criticalUrls.push(`/elements/${type}/${type}-${i}.png`);
        }
      });

      await preloadImages(criticalUrls, (loaded, total) =>
        setPreloadProgress(loaded / total),
      );
      setPreloadDone(true);

      // Varyantlar uygulama açıldıktan sonra arka planda yüklenir
      const variantUrls = [];
      [
        ["hair", hairData.variants],
        ["eyewear", eyewearData.variants],
        ["outfit", outfitData.variants],
      ].forEach(([type, files]) => {
        files.forEach(({ file, variantCount }) => {
          for (let v = 1; v <= variantCount; v += 1) {
            variantUrls.push(`/elements/${type}/${file}-v${v}.png`);
          }
        });
      });
      preloadImages(variantUrls);
    }

    fetchFileCounts();
  }, []);

  // Bileşen kaldırılırsa çalışan animasyonları durdur
  useEffect(
    () => () => {
      if (characterBoxRef.current) anime.remove(characterBoxRef.current);
    },
    [],
  );

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

  const pickVariant = (type, index) => {
    const count = getVariantCount(type, index);
    return count > 0 ? Math.floor(Math.random() * (count + 1)) : 0;
  };

  const pickRandomSetFor = (hairI, eyewearI, outfitI) => ({
    hair: hairI,
    eyewear: eyewearI,
    outfit: outfitI,
    hairVariant: pickVariant("hair", hairI),
    eyewearVariant: pickVariant("eyewear", eyewearI),
    outfitVariant: pickVariant("outfit", outfitI),
  });

  const randomIndex = (count) => Math.floor(Math.random() * (count || 1));

  // Slot şeridi hücrelerini üret; son hücre hedef öğeye oturur
  const buildSpinSequence = (count, finalIndex, cells) => {
    const start = randomIndex(count);
    const seq = Array.from({ length: cells }, (_, i) => (start + i) % count);
    if (count > 1 && seq[cells - 2] === finalIndex) {
      seq[cells - 2] = (finalIndex + 1) % count;
    }
    seq[cells - 1] = finalIndex;
    return seq;
  };

  // Slot makinesi randomize: shuffle boyunca seçim state'leri dokunulmaz,
  // soldaki 3 kare aktif sekmenin öğeleriyle döner; sonuç en sonda tek
  // seferde commit edilir (reveal). Karakter de o anda güncellenir.
  const handleRandomize = () => {
    if (shuffleRunningRef.current) return;
    if (!numHairFiles || !numEyewearFiles || !numOutfitFiles) return;
    shuffleRunningRef.current = true;

    const totals = {
      hair: numHairFiles,
      eyewear: numEyewearFiles,
      outfit: numOutfitFiles,
    };
    const result = pickRandomSetFor(
      randomIndex(numHairFiles),
      randomIndex(numEyewearFiles),
      randomIndex(numOutfitFiles),
    );

    // 3 kare sırayla: prev / final / next konumlarına oturur
    const finalIndex = result[activeTab];
    const total = totals[activeTab];
    const landing = [
      (finalIndex - 1 + total) % total,
      finalIndex,
      (finalIndex + 1) % total,
    ];

    setSpinPlan({
      type: activeTab,
      seqs: landing.map((land, tileIndex) =>
        buildSpinSequence(total, land, TILE_SPIN_CELLS[tileIndex]),
      ),
      result,
      token: Date.now(),
    });
    setShuffling(true);
  };

  // Şeritler durdu: tüm seçimi tek render'da commit et ve karakteri reveal et
  const commitSpin = (result) => {
    unstable_batchedUpdates(() => {
      setDirection("next");
      setHair(result.hair);
      setEyewear(result.eyewear);
      setOutfit(result.outfit);
      setHairVariants((prev) => ({
        ...prev,
        [result.hair]: result.hairVariant,
      }));
      setEyewearVariants((prev) => ({
        ...prev,
        [result.eyewear]: result.eyewearVariant,
      }));
      setOutfitVariants((prev) => ({
        ...prev,
        [result.outfit]: result.outfitVariant,
      }));
      setSpinPlan(null);
      setShuffling(false);
    });
    shuffleRunningRef.current = false;

    requestAnimationFrame(() => {
      const characterEl = characterBoxRef.current;
      if (!characterEl) return;
      anime.remove(characterEl);
      anime({
        targets: characterEl,
        opacity: [0.25, 1],
        scale: [0.965, 1],
        duration: 320,
        easing: "easeOutBack",
      });
    });
  };

  // Spin yarıda kesilirse (beklenmedik unmount) guard'ı serbest bırak
  const cancelSpin = () => {
    unstable_batchedUpdates(() => {
      setSpinPlan(null);
      setShuffling(false);
    });
    shuffleRunningRef.current = false;
  };

  // Shuffle sırasında sekme değiştirmek spin'i keseceği için kilitli
  const handleTabChange = (tabId) => {
    if (shuffleRunningRef.current) return;
    setActiveTab(tabId);
  };

  const handlePrevious = (setter, currentValue, maxValue) => {
    setter(currentValue === 0 ? maxValue - 1 : currentValue - 1);
  };

  const handleNext = (setter, currentValue, maxValue) => {
    setter(currentValue === maxValue - 1 ? 0 : currentValue + 1);
  };

  // Önizleme katmanlarının kayma yönünü belirle
  const goToPrevious = (setter, currentValue, maxValue) => {
    setDirection("prev");
    handlePrevious(setter, currentValue, maxValue);
  };

  const goToNext = (setter, currentValue, maxValue) => {
    setDirection("next");
    handleNext(setter, currentValue, maxValue);
  };

  const handleDownload = () => {
    const characterWrapper = document.querySelector(
      `.${styles.characterWrapper}`,
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
    { id: "hair", label: "Hair", icon: HairIcon },
    { id: "eyewear", label: "Eyewear", icon: GlassesIcon },
    { id: "outfit", label: "Outfit", icon: ShirtIcon },
  ];

  const tabConfig = {
    hair: {
      title: "Hair Style",
      current: hair,
      total: numHairFiles,
      setItem: setHair,
      variants: hairVariants,
      onVariantChange: handleHairVariantChange,
      open: openHairVariant,
      setOpen: setOpenHairVariant,
    },
    eyewear: {
      title: "Eyewear Style",
      current: eyewear,
      total: numEyewearFiles,
      setItem: setEyewear,
      variants: eyewearVariants,
      onVariantChange: handleEyewearVariantChange,
      open: openEyewearVariant,
      setOpen: setOpenEyewearVariant,
    },
    outfit: {
      title: "Outfit Style",
      current: outfit,
      total: numOutfitFiles,
      setItem: setOutfit,
      variants: outfitVariants,
      onVariantChange: handleOutfitVariantChange,
      open: openOutfitVariant,
      setOpen: setOpenOutfitVariant,
    },
  };

  // Aktif tab'ın içeriğini render et
  const renderTabContent = () => {
    const config = tabConfig[activeTab];
    if (!config) return null;

    const {
      title,
      current,
      total,
      setItem,
      variants,
      onVariantChange,
      open,
      setOpen,
    } = config;
    const variantCount = getVariantCount(activeTab, current);

    return (
      <div className={styles.tabContent}>
        <ItemSelector
          key={activeTab}
          title={title}
          type={activeTab}
          current={current}
          total={total}
          onPrevious={() => goToPrevious(setItem, current, total)}
          onNext={() => goToNext(setItem, current, total)}
          spin={spinPlan}
          onSpinComplete={() => commitSpin(spinPlan.result)}
          onSpinCancel={cancelSpin}
        />
        {variantCount > 0 && (
          <div className={styles.variantWrapper}>
            <button
              type="button"
              className={styles.variantToggle}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? "Hide Variants" : "Show Variants"}
              <VariantChevron flipped={open} />
            </button>
            <div
              className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
            >
              <div className={styles.drawerInner}>
                <div className={styles.variantControls}>
                  <button
                    type="button"
                    className={styles.variantButton}
                    aria-label="Önceki varyant"
                    onClick={() =>
                      handlePrevious(
                        onVariantChange,
                        variants[current] || 0,
                        variantCount + 1,
                      )
                    }
                  >
                    <ArrowLeftIcon className={styles.variantArrowIcon} />
                  </button>
                  <span className={styles.variantCount}>
                    Variant {(variants[current] || 0) + 1} / {variantCount + 1}
                  </span>
                  <button
                    type="button"
                    className={styles.variantButton}
                    aria-label="Sonraki varyant"
                    onClick={() =>
                      handleNext(
                        onVariantChange,
                        variants[current] || 0,
                        variantCount + 1,
                      )
                    }
                  >
                    <ArrowRightIcon className={styles.variantArrowIcon} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className={styles.characterEditor}>
      <Preloader progress={preloadProgress} done={preloadDone} />

      <section className={`${styles.card} ${styles.controlsCard}`}>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className={styles.controlColumn}>{renderTabContent()}</div>
      </section>

      <aside className={`${styles.card} ${styles.previewCard}`}>
        <h2 className={styles.previewTitle}>Preview</h2>
        <div className={styles.characterWrapper} ref={characterBoxRef}>
          <Character
            hair={hair}
            eyewear={eyewear}
            outfit={outfit}
            hairVariant={hairVariants[hair] || 0}
            eyewearVariant={eyewearVariants[eyewear] || 0}
            outfitVariant={outfitVariants[outfit] || 0}
            direction={direction}
          />
        </div>
        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={handleRandomize}
            className={styles.randomizeButton}
            disabled={shuffling}
          >
            <RandomizeIcon className={styles.buttonIcon} aria-hidden="true" />
            Randomize BRO
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={styles.downloadButton}
          >
            <DownloadIcon className={styles.buttonIcon} aria-hidden="true" />
            Download BRO
          </button>
        </div>
      </aside>
    </main>
  );
}

export default CharacterEditor;
