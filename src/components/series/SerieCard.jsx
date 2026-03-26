"use client";

import styles from "./SerieCard.module.css";
import Icon from "@mdi/react";
import { mdiCheck, mdiBookmarkPlusOutline, mdiHeartOutline, mdiCancel, mdiPlaylistPlus } from "@mdi/js";
import Link from "next/link";
import Image from "next/image";
import { useSeries } from "@/hooks/useSeries";
import { useState, useEffect, useRef } from "react";

export default function SerieCard({ serie, onCheck }) {
  const { isTracked, isFavorite, toggle, toggleFavorite } = useSeries(serie.id, serie);
  const [showConfirm, setShowConfirm] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!showConfirm) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showConfirm]);

  const handleCheck = () => {
    if (onCheck) {
      onCheck(serie);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = (confirm) => {
    if (isTracked) {
      if (confirm) toggle();
    } else {
      if (confirm) toggle({ markAllWatched: true, status: "completed" });
    }
    setShowConfirm(false);
  };

  return (
    <div className={`tooltip-wrapper ${styles.container}`}>
      {/* Tooltip */}
      <div className="tooltip">{serie.name}</div>

      {/* Carte */}
      <div className={`card ${styles.card}`}>
        <div className={styles.imageContainer}>
          <Link href={`/series/${serie.id}`} className={styles.imageLink}>
            {serie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                alt={serie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.image}
                priority={true}
              />
            ) : (
              <div className={styles.placeholderContainer}>{serie.name}</div>
            )}
          </Link>

          {/* Badge année */}
          {serie.first_air_date && <span className={styles.yearBadge}>{serie.first_air_date.slice(0, 4)}</span>}
        </div>

        <div className={`card-footer ${styles.footer}`}>
          <div className={styles.buttonsContainer}>
            <div className={styles.checkWrapper}>
              {/* Popover de confirmation */}
              {showConfirm && (
                <div className={styles.confirmPopover} ref={popoverRef}>
                  {isTracked ? (
                    <>
                      <p>
                        Remove <strong>{serie.name}</strong> from watched shows?
                      </p>
                      <div className={styles.confirmButtons}>
                        <span className={styles.validate} onClick={() => handleConfirm(true)}>
                          <Icon path={mdiCheck} size={0.8} />
                        </span>
                        <span className={styles.cancel} onClick={() => handleConfirm(false)}>
                          <Icon path={mdiCancel} size={0.8} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Add <strong>{serie.name}</strong> to watched shows?
                      </p>
                      <div className={styles.confirmButtons}>
                        <span className={styles.validate} onClick={() => handleConfirm(true)}>
                          <Icon path={mdiCheck} size={0.8} />
                        </span>
                        <span className={styles.cancel} onClick={() => handleConfirm(false)}>
                          <Icon path={mdiCancel} size={0.8} />
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Bouton check */}
              <button
                className={`btn check ${styles.button} ${isTracked ? "active" : ""}`}
                onClick={handleCheck}
                title={isTracked ? "Not watched" : "Watched"}
              >
                <Icon path={mdiCheck} size={1} />
              </button>

              {/* Bouton bookmark */}
              <button
                className={`btn bookmark ${styles.button} ${isFavorite ? "active" : ""} ${!isTracked ? "disabled" : ""}`}
                onClick={toggleFavorite}
              >
                <Icon path={mdiBookmarkPlusOutline} size={1} />
              </button>

              {/* Bouton watchlist */}
              <button
                className={`btn watchlist ${styles.button}`}
                title={
                  !isTracked ? "Follow this show first" : isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                disabled={!isTracked}
              >
                <Icon path={mdiPlaylistPlus} size={1} />
              </button>
            </div>
          </div>
          <div className={styles.infoContainer}>
            {serie.vote_average > 0 && (
              <>
                <Icon path={mdiHeartOutline} size={0.8} color="var(--red)" />
                <span className={styles.rating}>{Math.round(serie.vote_average * 10)}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
