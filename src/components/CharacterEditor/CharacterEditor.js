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
  const [numHairFiles, setNumHairFiles] = React.useState(5);
  const [numEyewearFiles, setNumEyewearFiles] = React.useState(4);
  const [numOutfitFiles, setNumOutfitFiles] = React.useState(6);

  useEffect(() => {
    async function fetchFileCounts() {
      const hairCount = await getFileCount("hair");
      const eyewearCount = await getFileCount("eyewear");
      const outfitCount = await getFileCount("outfit");

      setNumHairFiles(hairCount);
      setNumEyewearFiles(eyewearCount);
      setNumOutfitFiles(outfitCount);
    }

    fetchFileCounts();
  }, []);

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

  return (
    <main className={styles.characterEditor}>
      <MaxWidthWrapper className={styles.maxWidthWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>$BRO CREATOR</h1>
          <p className={styles.description}>
            Use the controller below to customize your $BRO.{" "}
          </p>
        </header>

        <div className={styles.controlColumn}>
          <ItemSelector
            title="Hair"
            current={hair}
            total={numHairFiles}
            onPrevious={() => handlePrevious(setHair, hair, numHairFiles)}
            onNext={() => handleNext(setHair, hair, numHairFiles)}
          />

          <ItemSelector
            title="Eyewear"
            current={eyewear}
            total={numEyewearFiles}
            onPrevious={() =>
              handlePrevious(setEyewear, eyewear, numEyewearFiles)
            }
            onNext={() => handleNext(setEyewear, eyewear, numEyewearFiles)}
          />

          <ItemSelector
            title="Outfit"
            current={outfit}
            total={numOutfitFiles}
            onPrevious={() => handlePrevious(setOutfit, outfit, numOutfitFiles)}
            onNext={() => handleNext(setOutfit, outfit, numOutfitFiles)}
          />
        </div>
      </MaxWidthWrapper>

      <div className={styles.characterWrapper}>
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
        />
      </div>
    </main>
  );
}

export default CharacterEditor;
