import React from "react";

import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      Made with love by{" "}
      <a
        href="https://t.me/Muny0x"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        Munky
      </a>
    </footer>
  );
};

export default Footer;
