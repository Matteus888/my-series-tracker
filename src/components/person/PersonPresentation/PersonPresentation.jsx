"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@mdi/react";
import {
  mdiCakeVariantOutline,
  mdiMapMarker,
  mdiCross,
  mdiOpenInNew,
  mdiInstagram,
  mdiFacebook,
  mdiYoutube,
  mdiWeb,
  mdiWikipedia,
} from "@mdi/js";
import { formatDate } from "@/lib/utils/date.utils";
import styles from "./PersonPresentation.module.css";

const BIO_TRUNCATE = 600;

export default function PersonPresentation({ person, stats }) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const bio = person.biography?.trim() || null;
  const isLongBio = bio && bio.length > BIO_TRUNCATE;
  const visibleBio = !bio ? null : isLongBio && !bioExpanded ? bio.slice(0, BIO_TRUNCATE).trimEnd() + "…" : bio;

  const isLatinAlias = (str) => {
    if (!str) return false;
    const latinChars = str.match(/[A-Za-zÀ-ÖØ-öø-ÿĀ-ſƀ-ɏ]/g) ?? [];
    const letterChars = str.match(/\p{L}/gu) ?? [];
    if (letterChars.length === 0) return false;
    return latinChars.length / letterChars.length >= 0.7;
  };

  const aliases = (person.alsoKnownAs ?? []).filter(isLatinAlias).slice(0, 3);

  const externalLinks = [
    person.externalIds.imdb && {
      href: `https://www.imdb.com/name/${person.externalIds.imdb}/`,
      icon: mdiOpenInNew,
      label: "IMDB",
    },
    person.externalIds.instagram && {
      href: `https://instagram.com/${person.externalIds.instagram}`,
      icon: mdiInstagram,
      label: "Instagram",
    },
    person.externalIds.facebook && {
      href: `https://facebook.com/${person.externalIds.facebook}`,
      icon: mdiFacebook,
      label: "Facebook",
    },
    person.externalIds.youtube && {
      href: `https://youtube.com/${person.externalIds.youtube}`,
      icon: mdiYoutube,
      label: "YouTube",
    },
    person.name && {
      href: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(person.name)}&go=Go`,
      icon: mdiWikipedia,
      label: "Wikipedia",
    },
    person.homepage && {
      href: person.homepage,
      icon: mdiWeb,
      label: "Website",
    },
  ].filter(Boolean);

  return (
    <div className={styles.presentation}>
      <div className={styles.topRow}>
        {/* Photo de profil */}
        <div className={styles.profileWrapper}>
          {person.profilePath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${person.profilePath}`}
              alt={person.name}
              width={500}
              height={750}
              className={styles.profileImage}
              priority
            />
          ) : (
            <div className={styles.profilePlaceholder}>{person.name.charAt(0)}</div>
          )}
        </div>

        {/* Infos */}
        <div className={styles.infoWrapper}>
          <div className={styles.info}>
            {/* Métier principal */}
            {/* {person.knownForDepartment && <div className={styles.department}>{person.knownForDepartment}</div>} */}

            {/* Stats */}
            {(stats.totalSeries > 0 || stats.totalEpisodes > 0) && (
              <div className={styles.statsRow}>
                {stats.totalSeries > 0 && (
                  <span className={styles.statItem}>
                    <strong>{stats.totalSeries}</strong> series
                  </span>
                )}
                {stats.totalEpisodes > 0 && (
                  <span className={styles.statItem}>
                    <strong>{stats.totalEpisodes}</strong> episodes
                  </span>
                )}
                {stats.yearsSpan && <span className={styles.statItem}>{stats.yearsSpan}</span>}
              </div>
            )}

            {/* Naissance / Décès */}
            <div className={styles.bioInfoBlock}>
              {person.birthday && (
                <div className={styles.bioInfoLine}>
                  <Icon path={mdiCakeVariantOutline} size={0.8} />
                  <span>
                    {formatDate(person.birthday)}
                    {person.age != null && !person.deathday && (
                      <span className={styles.ageSuffix}> ({person.age} years old)</span>
                    )}
                  </span>
                </div>
              )}
              {person.deathday && (
                <div className={styles.bioInfoLine}>
                  <Icon path={mdiCross} size={0.8} />
                  <span>
                    {formatDate(person.deathday)}
                    {person.age != null && <span className={styles.ageSuffix}> (aged {person.age})</span>}
                  </span>
                </div>
              )}
              {person.placeOfBirth && (
                <div className={styles.bioInfoLine}>
                  <Icon path={mdiMapMarker} size={0.8} />
                  <span>{person.placeOfBirth}</span>
                </div>
              )}
            </div>

            {/* Aliases */}
            {aliases.length > 0 && (
              <div className={styles.aliases}>
                <span className={styles.aliasesLabel}>Also known as:</span>
                <span className={styles.aliasesValue}>{aliases.join(" · ")}</span>
              </div>
            )}

            {/* Biography */}
            {bio && (
              <div className={styles.biography}>
                <p>{visibleBio}</p>
                {isLongBio && (
                  <button type="button" onClick={() => setBioExpanded((v) => !v)} className={styles.readMore}>
                    {bioExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* External links */}
          {externalLinks.length > 0 && (
            <div className={styles.actionsBar}>
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionLink}
                  title={link.label}
                  aria-label={link.label}
                >
                  <Icon path={link.icon} size={0.9} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
