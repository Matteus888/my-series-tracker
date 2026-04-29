import styles from "./SettingsHeader.module.css";

export default function SettingsHeader({ tabs, activeTab, onTabChange }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}
