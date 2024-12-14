import React from "react";
import styles from "./ItemSelector.module.css";

function ItemSelector({ title, current, total, onPrevious, onNext }) {
  return (
    <div className={styles.itemSelector}>
      <h2 className={styles.title}>
        {title}
        <span className={styles.metadata}>
          {current + 1} / {total}
        </span>
      </h2>

      <div className={styles.controls}>
        <button
          onClick={onPrevious}
          className={styles.arrowButton}
          aria-label="Önceki"
        >
          ←
        </button>

        <button
          onClick={onNext}
          className={styles.arrowButton}
          aria-label="Sonraki"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default ItemSelector;
