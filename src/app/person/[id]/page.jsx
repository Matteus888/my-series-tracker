import { APP_NAME } from "@/lib/constants/app.constants";

export const metadata = {
  title: `Person - ${APP_NAME}`,
};

export default async function PersonPage({ params }) {
  const { id } = await params;
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Person details</h1>
      <p style={{ opacity: 0.7, marginTop: "1rem" }}>TMDB person id: {id}</p>
      <p style={{ opacity: 0.5, marginTop: "0.5rem", fontSize: "0.9rem" }}>Page coming soon.</p>
    </div>
  );
}
