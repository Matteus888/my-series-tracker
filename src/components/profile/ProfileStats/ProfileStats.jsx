"use client";

import styles from "./ProfileStats.module.css";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import Image from "next/image";

function BarRow({ label, count, max, sublabel }) {
  const percent = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className={styles.barRow}>
      <div className={styles.barLabel}>
        {label}
        {sublabel && <span className={styles.barSublabel}>{sublabel}</span>}
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.barCount}>{count}</span>
    </div>
  );
}

export default function ProfileStats({ aggregations, username }) {
  const { topGenres = [], topNetworks = [], decades = [] } = aggregations ?? {};

  // Rien à afficher si aucune donnée
  if (topGenres.length === 0 && topNetworks.length === 0 && decades.length === 0) {
    return null;
  }

  const maxGenre = Math.max(...topGenres.map((g) => g.count), 0);
  const maxNetwork = Math.max(...topNetworks.map((n) => n.count), 0);
  const maxDecade = Math.max(...decades.map((d) => d.count), 0);

  return (
    <SectionHeader title="Taste & stats" storageKey={`profile-${username}-stats-open`} defaultOpen>
      <div className={styles.grid}>
        {/* ─── Top genres ─── */}
        {topGenres.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Top genres</h3>
            <div className={styles.bars}>
              {topGenres.map((g) => (
                <BarRow key={g.name} label={g.name} count={g.count} max={maxGenre} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Top networks ─── */}
        {topNetworks.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Top networks</h3>
            <div className={styles.networks}>
              {topNetworks.map((n) => (
                <div key={n.id} className={styles.networkRow}>
                  <div className={styles.networkLogo}>
                    {n.logoPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${n.logoPath}`}
                        alt={n.name}
                        width={50}
                        height={25}
                        className={styles.networkLogoImg}
                      />
                    ) : (
                      <span className={styles.networkName}>{n.name}</span>
                    )}
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${maxNetwork > 0 ? Math.round((n.count / maxNetwork) * 100) : 0}%` }}
                    />
                  </div>
                  <span className={styles.barCount}>{n.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Decades ─── */}
        {decades.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>By decade</h3>
            <div className={styles.decades}>
              {decades.map((d) => {
                const percent = maxDecade > 0 ? Math.round((d.count / maxDecade) * 100) : 0;
                return (
                  <div key={d.decade} className={styles.decadeCol}>
                    <div className={styles.decadeBarWrapper}>
                      <div className={styles.decadeBar} style={{ height: `${percent}%` }}>
                        <span className={styles.decadeCount}>{d.count}</span>
                      </div>
                    </div>
                    <span className={styles.decadeLabel}>{d.decade}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SectionHeader>
  );
}
