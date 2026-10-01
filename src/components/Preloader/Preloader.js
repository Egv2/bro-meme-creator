import React, { useEffect, useState } from "react";
import styles from "./Preloader.module.css";

function Preloader({ progress = 0, done = false }) {
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    if (!done) return undefined;
    const timeoutId = setTimeout(() => setUnmounted(true), 700);
    return () => clearTimeout(timeoutId);
  }, [done]);

  if (unmounted) return null;

  return (
    <div className={`${styles.overlay} ${done ? styles.done : ""}`}>
      <div className={styles.content}>
        <svg
          viewBox="0 0 100 100"
          className={styles.doodleArrow}
          aria-hidden="true"
        >
          <path
            d="M54 13 C 34 10 15 26 14 47 C 13 70 31 87 52 87 C 72 87 87 72 87 53 C 87 38 78 25 64 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M60 5 L 65 20 L 50 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={styles.label}>Loading BRO's</p>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className={styles.percentage}>{Math.round(progress * 100)}%</span>
      </div>
    </div>
  );
}

export default Preloader;
