import { useId } from "react";

export default function HeartRating({ percentage }) {
  const id = useId();
  const clipId = `heart-clip-${id}`;

  // Le rectangle commence à fillStart et descend jusqu'en bas
  // Plus le percentage est élevé, plus fillStart est haut (petit y)
  const fillStart = 24 - (24 * percentage) / 100;

  return (
    <svg viewBox="0 0 24 24" width="19" height="19">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={fillStart} width="24" height="24" />
        </clipPath>
      </defs>

      {/* Cœur vide — contour */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Cœur plein — remplissage clipé selon le percentage */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
