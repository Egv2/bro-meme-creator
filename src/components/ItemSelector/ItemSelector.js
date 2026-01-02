import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import styles from "./ItemSelector.module.css";

function ItemSelector({ title, type, current, total, onPrevious, onNext }) {
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;

  const getImagePath = (index) => {
    if (!type) return null;
    return `/elements/${type}/${type}-${index + 1}.png`;
  };

  return (
    <div className={styles.itemSelector}>
      <h2 className={styles.title}>
        {title}
        <span className={styles.metadata}>
          {current + 1} / {total}
        </span>
      </h2>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          {type && (
            <div className={styles.preview}>
              <img src={getImagePath(prevIndex)} alt="Previous item" />
            </div>
          )}
          <button
            onClick={onPrevious}
            className={styles.arrowButton}
            aria-label="Önceki"
          >
            <span>
              <CaretLeft size={24} weight="bold" />
            </span>
          </button>
        </div>

        <div className={styles.controlGroup}>
          {type && (
            <div className={styles.preview}>
              <img src={getImagePath(nextIndex)} alt="Next item" />
            </div>
          )}
          <button
            onClick={onNext}
            className={styles.arrowButton}
            aria-label="Sonraki"
          >
            <span>
              <CaretRight size={24} weight="bold" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemSelector;
