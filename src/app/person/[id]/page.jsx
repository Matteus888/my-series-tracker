import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { getPersonFullData } from "@/lib/api/person.api";
import { APP_NAME } from "@/lib/constants/app.constants";
import PersonHeroMosaic from "@/components/person/PersonHeroMosaic/PersonHeroMosaic";
import PersonPresentation from "@/components/person/PersonPresentation/PersonPresentation";

// Mets à true pour avoir la version floutée
const HERO_BLUR = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const { person } = await getPersonFullData(id);
    return { title: `${person.name} - ${APP_NAME}` };
  } catch {
    return { title: `Person - ${APP_NAME}` };
  }
}

export const dynamic = "force-dynamic";

export default async function PersonPage({ params }) {
  const { id } = await params;

  let data;
  try {
    data = await getPersonFullData(id);
  } catch {
    notFound();
  }

  const { person, knownFor, filmography, stats, episodesInTrackedShows, heroPosterPaths } = data;

  return (
    <div className={styles.container}>
      {/* Hero fixed en background */}
      <PersonHeroMosaic posters={heroPosterPaths} blurred={HERO_BLUR} />

      {/* Spacer + nom */}
      <div className={styles.heroSpacer} aria-hidden="true">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{person.name}</h1>
          {person.knownForDepartment && <p className={styles.heroSubtitle}>{person.knownForDepartment}</p>}
        </div>
      </div>

      {/* Carte de présentation */}
      <PersonPresentation person={person} stats={stats} />
    </div>
  );
}
