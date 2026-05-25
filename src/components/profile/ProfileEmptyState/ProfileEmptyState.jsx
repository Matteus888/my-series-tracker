import Link from "next/link";
import Icon from "@mdi/react";
import styles from "./ProfileEmptyState.module.css";

export default function ProfileEmptyState({ icon, title, text, action }) {
  return (
    <div className={styles.container}>
      {icon && <Icon path={icon} size={2.5} className={styles.icon} />}
      <h3 className={styles.title}>{title}</h3>
      {text && <p className={styles.text}>{text}</p>}
      {action && (
        <Link href={action.href} className={styles.action}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
