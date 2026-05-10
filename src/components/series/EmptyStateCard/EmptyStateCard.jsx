import Icon from "@mdi/react";
import styles from "./EmptyStateCard.module.css";

export default function EmptyStateCard({ icon, label, subtitle, action, inCarousel = false }) {
  return (
    <div className={`${styles.card} ${inCarousel ? styles.inCarousel : ""}`}>
      {icon && (
        <div className={styles.iconWrapper}>
          <Icon path={icon} size={1.4} />
        </div>
      )}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}
