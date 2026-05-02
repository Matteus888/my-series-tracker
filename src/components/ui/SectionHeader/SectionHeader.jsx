"use client";

import styles from "./SectionHeader.module.css";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiChevronRight, mdiArrowDownDropCircleOutline, mdiArrowUpDropCircleOutline } from "@mdi/js";
import { usePersistedOpen } from "@/hooks/usePersistedOpen";
import { useState } from "react";

export default function SectionHeader({
  title,
  subtitle,
  href,
  icon,
  hasContent = true,
  defaultOpen = true,
  children,
  storageKey,
  actions,
}) {
  const persistedState = usePersistedOpen(storageKey ?? null, defaultOpen);
  const localState = useState(defaultOpen);

  const [isOpen, setIsOpen] = storageKey ? persistedState : localState;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button className={styles.toggleBtn} onClick={handleToggle}>
          <Icon
            path={isOpen ? mdiArrowUpDropCircleOutline : mdiArrowDownDropCircleOutline}
            size={1.2}
            className={styles.chevron}
          />
        </button>
        {href ? (
          <Link href={href} className={styles.link}>
            <h2 className={styles.title}>{title}</h2>
            {icon && hasContent && <Icon path={icon} size={1} className={styles.icon} />}
            {isOpen && <Icon path={mdiChevronRight} size={1.2} className={styles.arrow} />}
          </Link>
        ) : (
          <>
            <h2 className={styles.title}>{title}</h2>
            {icon && hasContent && <Icon path={icon} size={1} className={styles.icon} />}
          </>
        )}
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={`${styles.collapsible} ${isOpen ? styles.open : styles.closed}`} aria-hidden={!isOpen}>
        <div className={styles.collapsibleInner}>{children}</div>
      </div>
    </div>
  );
}
