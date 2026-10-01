import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons";
import styles from "./ItemSelector.module.css";

function ItemSelector({
  title,
  type,
  current,
  total,
  slideEnabled = true,
  onPrevious,
  onNext,
}) {
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;

  // track direction across wrap-around so the slide goes the right way
  const [direction, setDirection] = useState("next");
  const previousCurrentRef = useRef(current);

  useEffect(() => {
    const previous = previousCurrentRef.current;
    if (previous === current) return;

    const wentNext =
      previous < current || (previous === total - 1 && current === 0);
    setDirection(wentNext ? "next" : "prev");
    previousCurrentRef.current = current;
  }, [current, total]);

  const getImagePath = (index) => {
    if (!type) return null;
    return `/elements/${type}/${type}-${index + 1}.png`;
  };

  // no slide on the shuffle commit, the result just stays put
  const slideClass = !slideEnabled
    ? undefined
    : direction === "prev"
    ? styles.slidePrev
    : styles.slideNext;

  return (
    <div className={styles.itemSelector} role="tabpanel" id={`panel-${type}`}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.tiles}>
        <button
          type="button"
          className={styles.tile}
          onClick={onPrevious}
          aria-label={`Previous ${title}`}
        >
          <img key={`prev-${prevIndex}`} src={getImagePath(prevIndex)} alt="" />
        </button>

        <div className={`${styles.tile} ${styles.currentTile}`}>
          <img
            key={current}
            src={getImagePath(current)}
            alt={`${title} option ${current + 1}`}
            className={slideClass}
          />
        </div>

        <button
          type="button"
          className={styles.tile}
          onClick={onNext}
          aria-label={`Next ${title}`}
        >
          <img key={`next-${nextIndex}`} src={getImagePath(nextIndex)} alt="" />
        </button>
      </div>

      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={onPrevious}
          aria-label="Önceki"
        >
          <ArrowLeftIcon className={styles.arrowIcon} />
        </button>
        <span key={current} className={`${styles.counter} ${slideClass}`}>
          {current + 1} / {total}
        </span>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={onNext}
          aria-label="Sonraki"
        >
          <ArrowRightIcon className={styles.arrowIcon} />
        </button>
      </div>
    </div>
  );
}

export default ItemSelector;
