import styles from "@/app/page.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.homeCard}>
        <div className={styles.logoSection}>
          <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        </div>
        <div>
          <h1 className={styles.title}>my-series-tracker</h1>
          <p className={styles.description}>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.descriptionLink}
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.descriptionLink}
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className={styles.buttons}>
          <a
            className={`${styles.deployButton} btn btn-primary`}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/vercel.svg" alt="Vercel logomark" width={16} height={16} />
            Deploy Now
          </a>
          <a
            className={`${styles.docButton} btn`}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
