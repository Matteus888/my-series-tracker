"use client";

import styles from "./VideoCard.module.css";
import Image from "next/image";
import { mdiPlayCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";

export default function VideoCard({ video, onClick }) {
  const thumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;

  return (
    <button className={styles.card} onClick={onClick} aria-label={`Play ${video.name}`}>
      <div className={styles.thumbWrapper}>
        <Image src={thumb} alt="" fill sizes="(max-width: 768px) 50vw, 300px" className={styles.thumb} loading="lazy" />
        <div className={styles.overlay}>
          <Icon path={mdiPlayCircleOutline} size={2} className={styles.playIcon} />
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.title} title={video.name}>
          {video.name}
        </span>
        {/* <span className={styles.meta}>
          {video.sourceLabel} · {video.type}
        </span> */}
      </div>
    </button>
  );
}
