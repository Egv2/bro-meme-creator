import React from "react";

import styles from "./ToggleButton.module.css";

const ToggleButton = ({ label, color, children, isSelected, ...delegated }) => {
  const isRandomizeButton = label === "Randomize character";

  return (
    <button
      {...delegated}
      aria-pressed={isSelected}
      className={styles.toggleButton}
      style={{
        backgroundColor: color,
        ...(isRandomizeButton && { width: "150px" }),
      }}
    >
      <span className="visually-hidden">{label}</span>
      {children}
    </button>
  );
};

export default ToggleButton;
