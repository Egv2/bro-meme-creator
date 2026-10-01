import React from "react";

import { GithubIcon } from "../icons";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.title}>BRO CREATOR</span>
      <a
        className={styles.githubButton}
        href="https://github.com/egv2"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubIcon className={styles.githubIcon} aria-hidden="true" />
        GitHub
      </a>
    </header>
  );
}

export default Header;
