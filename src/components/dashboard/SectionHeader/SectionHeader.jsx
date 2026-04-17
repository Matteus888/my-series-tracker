import styles from "./SectionHeader.module.css";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiChevronRight } from "@mdi/js";

export default function SectionHeader({ title, href }) {
  return (
    <div className={styles.container}>
      <Link href={href} className={styles.link}>
        <h2 className={styles.title}>{title}</h2>
        <Icon path={mdiChevronRight} size={1} className={styles.arrow} />
      </Link>
    </div>
  );
}
