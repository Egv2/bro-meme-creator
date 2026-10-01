import React from "react";
import styles from "./TabNavigation.module.css";

function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className={styles.tabList} role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.active : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.tabIcon}>
              <Icon aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TabNavigation;
