import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
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
          <span>
            <CaretLeft size={24} weight="bold" />
          </span>
        </button>

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
  );
}

export default ItemSelector;
