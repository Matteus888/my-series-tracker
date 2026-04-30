import styles from "./PageTitle.module.css";
import Icon from "@mdi/react";

export default function PageTitle({ title, icon }) {
  return (
    <h2 className={styles.title}>
      <span>{title}</span>
      {icon && <Icon path={icon} size={1.1} className={styles.icon} />}
    </h2>
  );
}
