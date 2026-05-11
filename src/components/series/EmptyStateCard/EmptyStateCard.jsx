import Icon from "@mdi/react";
import Link from "next/link";
import styles from "./EmptyStateCard.module.css";

export default function EmptyStateCard({ icon, label, subtitle, action, links, inCarousel = false }) {
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

        {links && links.length > 0 && (
          <div className={styles.links}>
            {links.map(({ href, label: linkLabel, icon: linkIcon }) => (
              <Link key={href} href={href} className={styles.chip}>
                {linkIcon && <Icon path={linkIcon} size={0.6} />}
                <span>{linkLabel}</span>
              </Link>
            ))}
          </div>
        )}

        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}
