import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPersonFullData } from "@/lib/api/person.api";
import { APP_NAME } from "@/lib/constants/app.constants";
import PersonHeroMosaic from "@/components/person/PersonHeroMosaic/PersonHeroMosaic";
import PersonPresentation from "@/components/person/PersonPresentation/PersonPresentation";
import PersonCreditCarousel from "@/components/person/PersonCreditCarousel/PersonCreditCarousel";
import PersonEpisodesByShow from "@/components/person/PersonEpisodesByShow/PersonEpisodesByShow";
import PersonGallery from "@/components/person/PersonGallery/PersonGallery";

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
  const session = await getServerSession(authOptions);

  let data;
  try {
    data = await getPersonFullData(id, session?.user?.id ?? null);
  } catch {
    notFound();
  }

  const { person, knownFor, filmography, stats, episodesInTrackedShows, heroPosterPaths } = data;

  return (
    <div className={styles.container}>
      {/* Hero fixed */}
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

      {/* Known for */}
      {knownFor.length > 0 && (
        <div className={styles.section}>
          <PersonCreditCarousel
            title="Known for"
            credits={knownFor}
            storageKey={`person-${id}-knownfor-open`}
            defaultOpen
          />
        </div>
      )}

      {/* Filmographie par département */}
      {filmography.map((dept) => (
        <div key={dept.department} className={styles.section}>
          <PersonCreditCarousel
            title={dept.department}
            credits={dept.credits}
            storageKey={`person-${id}-dept-${dept.department.toLowerCase()}-open`}
            defaultOpen={dept.department === filmography[0].department}
          />
        </div>
      ))}

      {/* Episodes featuring [name] (séries en base seulement) */}
      {episodesInTrackedShows.length > 0 && (
        <div className={styles.section}>
          <PersonEpisodesByShow groups={episodesInTrackedShows} personName={person.name} personTmdbId={id} />
        </div>
      )}

      {/* Galerie photos */}
      {person.profileImages?.length > 0 && (
        <div className={styles.section}>
          <PersonGallery
            images={person.profileImages}
            personName={person.name}
            storageKey={`person-${id}-gallery-open`}
          />
        </div>
      )}
    </div>
  );
}
