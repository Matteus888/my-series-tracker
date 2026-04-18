"use client";

import styles from "./SectionHeader.module.css";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiChevronRight, mdiChevronDownCircleOutline, mdiChevronUpCircleOutline } from "@mdi/js";
import { useState } from "react";

export default function SectionHeader({ title, href, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button className={styles.toggleBtn} onClick={handleToggle}>
          <Icon
            path={isOpen ? mdiChevronUpCircleOutline : mdiChevronDownCircleOutline}
            size={0.8}
            className={styles.chevron}
          />
        </button>
        {href ? (
          <Link href={href} className={styles.link}>
            <h2 className={styles.title}>{title}</h2>
            <Icon path={mdiChevronRight} size={1} className={styles.arrow} />
          </Link>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}
      </div>
      {isOpen && children}
    </div>
  );
}
