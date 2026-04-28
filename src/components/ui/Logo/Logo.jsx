import styles from "./Logo.module.css";

export default function Logo({ size = 40, animated = false, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="My Series Tracker"
      className={`${animated ? styles.animated : ""} ${className}`}
    >
      <rect x="6" y="6" width="88" height="88" rx="22" fill="var(--blue)" />
      <path
        className={styles.check}
        d="M24 54 L42 72 L80 26"
        stroke="var(--foreground)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
