"use client";

import styles from "./SectionEmptyState.module.css";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiChevronRight } from "@mdi/js";

export default function SectionEmptyState({ icon, message, ctaLabel, ctaHref }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <Icon path={icon} size={1.4} />
      </div>
      <p className={styles.message}>{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={styles.cta}>
          <span className={styles.ctaText}>{ctaLabel}</span>
          <Icon path={mdiChevronRight} size={1.2} className={styles.ctaChevron} />
        </Link>
      )}
    </div>
  );
}
