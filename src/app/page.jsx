import Image from "next/image";

export default function Home() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <main className="container bg-white p-5 shadow-sm rounded" style={{ maxWidth: "800px" }}>
        <div className="mb-5">
          <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        </div>
        <div className="mb-5">
          <h1 className="fw-semibold mb-3">my-series-tracker</h1>
          <p className="text-muted fs-5">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="link-primary text-decoration-none"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="link-primary text-decoration-none"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-3">
          <a
            className="btn btn-dark d-flex align-items-center gap-2"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/vercel.svg" alt="Vercel logomark" width={16} height={16} />
            Deploy Now
          </a>
          <a
            className="btn btn-outline-secondary"
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
