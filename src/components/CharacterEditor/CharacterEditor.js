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
import { elementUrl, originalElementUrl } from "../../utils/elementUrl";
import getFileCount from "../../utils/getFileCount";

import { defaultHair, defaultEyewear, defaultOutfit } from "../../constants";
import Character from "../Character";
import ItemSelector from "../ItemSelector";
import TabNavigation from "../TabNavigation";
import Preloader from "../Preloader";

import styles from "./CharacterEditor.module.css";

// flicker frame delays in ms, fast at first then easing into the result
const FLICKER_DELAYS = [55, 55, 55, 60, 65, 75, 90, 105];
const REVEAL_MS = 380;

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

  const [activeTab, setActiveTab] = React.useState("hair");

  const [hairVariants, setHairVariants] = React.useState({});
  const [eyewearVariants, setEyewearVariants] = React.useState({});
  const [outfitVariants, setOutfitVariants] = React.useState({});

  const [openHairVariant, setOpenHairVariant] = React.useState(false);
  const [openEyewearVariant, setOpenEyewearVariant] = React.useState(false);
  const [openOutfitVariant, setOpenOutfitVariant] = React.useState(false);

  const [numHairFiles, setNumHairFiles] = React.useState(0);
  const [numEyewearFiles, setNumEyewearFiles] = React.useState(0);
  const [numOutfitFiles, setNumOutfitFiles] = React.useState(0);
  const [variantCounts, setVariantCounts] = React.useState({
    hair: [],
    eyewear: [],
    outfit: [],
  });
  const [preloadProgress, setPreloadProgress] = React.useState(0);
  const [preloadDone, setPreloadDone] = React.useState(false);

  const [shuffling, setShuffling] = React.useState(false);
  const [direction, setDirection] = React.useState("next");
  const shuffleRunningRef = React.useRef(false);

  // scratch combo that only feeds the preview while flashing
  const [shuffleFrame, setShuffleFrame] = React.useState(null);
  const flickerTimerRef = React.useRef(null);
  // no layer slide on the shuffle commit, the blur reveal handles it
  const skipSlideRef = React.useRef(false);
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

      const initialHairVariants = {};
      const initialEyewearVariants = {};
      const initialOutfitVariants = {};

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

      // the preloader only gates on the default combo shown at first paint;
      // every other item and variant streams in behind it from the CDN
      const criticalUrls = [
        elementUrl("/elements/base/base-body.png"),
        elementUrl(`/elements/hair/hair-${defaultHair + 1}.png`),
        elementUrl(`/elements/eyewear/eyewear-${defaultEyewear + 1}.png`),
        elementUrl(`/elements/outfit/outfit-${defaultOutfit + 1}.png`),
      ];

      await preloadImages(criticalUrls, (loaded, total) =>
        setPreloadProgress(loaded / total),
      );
      setPreloadDone(true);

      // remaining items and variants keep loading in the background
      const backgroundUrls = [];
      [
        ["hair", hairData.count],
        ["eyewear", eyewearData.count],
        ["outfit", outfitData.count],
      ].forEach(([type, count]) => {
        for (let i = 1; i <= count; i += 1) {
          backgroundUrls.push(elementUrl(`/elements/${type}/${type}-${i}.png`));
        }
      });
      [
        ["hair", hairData.variants],
        ["eyewear", eyewearData.variants],
        ["outfit", outfitData.variants],
      ].forEach(([type, files]) => {
        files.forEach(({ file, variantCount }) => {
          for (let v = 1; v <= variantCount; v += 1) {
            backgroundUrls.push(elementUrl(`/elements/${type}/${file}-v${v}.png`));
          }
        });
      });
      preloadImages(backgroundUrls);
    }

    fetchFileCounts();
  }, []);

  // stop the flash chain and running animations on unmount
  useEffect(
    () => () => {
      shuffleRunningRef.current = false;
      clearTimeout(flickerTimerRef.current);
      if (characterBoxRef.current) anime.remove(characterBoxRef.current);
    },
    [],
  );

  const getVariantCount = (type, index) => {
    const variants = variantCounts[type];

    if (!variants) return 0;

    const fileName = `${type}-${index + 1}`;

    const fileVariant = variants.find((v) => v.file === fileName);

    return fileVariant ? fileVariant.variantCount : 0;
  };

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

  // flash the preview through random combos, then commit the result in one
  // render and sharpen the character in from a blur
  const handleRandomize = () => {
    if (shuffleRunningRef.current) return;
    if (!numHairFiles || !numEyewearFiles || !numOutfitFiles) return;
    shuffleRunningRef.current = true;
    setShuffling(true);

    const result = pickRandomSetFor(
      randomIndex(numHairFiles),
      randomIndex(numEyewearFiles),
      randomIndex(numOutfitFiles),
    );

    let frame = 0;
    const flash = () => {
      if (!shuffleRunningRef.current) return;
      if (frame < FLICKER_DELAYS.length) {
        setShuffleFrame(
          pickRandomSetFor(
            randomIndex(numHairFiles),
            randomIndex(numEyewearFiles),
            randomIndex(numOutfitFiles),
          ),
        );
        flickerTimerRef.current = setTimeout(flash, FLICKER_DELAYS[frame]);
        frame += 1;
      } else {
        commitResult(result);
      }
    };
    flickerTimerRef.current = setTimeout(flash, FLICKER_DELAYS[0]);
  };

  // single render commit, no layer slide, the blur reveal is the reveal
  const commitResult = (result) => {
    skipSlideRef.current = true;
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
      setShuffleFrame(null);
      setShuffling(false);
    });
    shuffleRunningRef.current = false;

    requestAnimationFrame(() => {
      const characterEl = characterBoxRef.current;
      if (!characterEl) return;
      anime.remove(characterEl);
      anime({
        targets: characterEl,
        filter: ["blur(10px)", "blur(0px)"],
        opacity: [0.5, 1],
        scale: [0.97, 1],
        duration: REVEAL_MS,
        easing: "easeOutCubic",
      });
    });
  };

  // tabs are locked while a shuffle is running
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

  const goToPrevious = (setter, currentValue, maxValue) => {
    if (shuffleRunningRef.current) return;
    skipSlideRef.current = false;
    setDirection("prev");
    handlePrevious(setter, currentValue, maxValue);
  };

  const goToNext = (setter, currentValue, maxValue) => {
    if (shuffleRunningRef.current) return;
    skipSlideRef.current = false;
    setDirection("next");
    handleNext(setter, currentValue, maxValue);
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1000;
    canvas.height = 1000;

    const suffix = (variant) => (variant > 0 ? `-v${variant + 1}` : "");
    const layerPaths = [
      "/elements/base/base-body.png",
      `/elements/hair/hair-${hair + 1}${suffix(hairVariants[hair] || 0)}.png`,
      `/elements/eyewear/eyewear-${eyewear + 1}${suffix(
        eyewearVariants[eyewear] || 0,
      )}.png`,
      `/elements/outfit/outfit-${outfit + 1}${suffix(
        outfitVariants[outfit] || 0,
      )}.png`,
    ];

    const loadedLayers = [];

    layerPaths.forEach((path, index) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        loadedLayers[index] = img;
        if (loadedLayers.filter(Boolean).length === layerPaths.length) {
          loadedLayers.forEach((layer) => {
            ctx.drawImage(layer, 0, 0, canvas.width, canvas.height);
          });

          const link = document.createElement("a");
          link.download = "my-bro.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      img.src = originalElementUrl(path);
    });
  };

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
          slideEnabled={!skipSlideRef.current}
          onPrevious={() => goToPrevious(setItem, current, total)}
          onNext={() => goToNext(setItem, current, total)}
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
            hair={shuffleFrame ? shuffleFrame.hair : hair}
            eyewear={shuffleFrame ? shuffleFrame.eyewear : eyewear}
            outfit={shuffleFrame ? shuffleFrame.outfit : outfit}
            hairVariant={
              shuffleFrame ? shuffleFrame.hairVariant : hairVariants[hair] || 0
            }
            eyewearVariant={
              shuffleFrame
                ? shuffleFrame.eyewearVariant
                : eyewearVariants[eyewear] || 0
            }
            outfitVariant={
              shuffleFrame
                ? shuffleFrame.outfitVariant
                : outfitVariants[outfit] || 0
            }
            direction={direction}
            shuffling={Boolean(shuffleFrame) || skipSlideRef.current}
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
