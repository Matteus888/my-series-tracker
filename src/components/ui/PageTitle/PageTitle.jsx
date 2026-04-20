import styles from "./PageTitle.module.css";

export default function PageTitle({ title }) {
  return <h2 className={styles.title}>{title}</h2>;
}
