import React from "react";

import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a
        href="https://github.com/egv2"
        target="_blank"
        rel="noopener noreferrer"
      >
        Drawn and developed with love by Serin
      </a>
    </footer>
  );
};

export default Footer;
