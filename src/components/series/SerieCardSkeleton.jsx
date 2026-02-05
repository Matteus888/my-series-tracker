export default function SerieCardSkeleton() {
  return (
    <div className="col p-0 m-0 h-100 d-flex" style={{ minWidth: "16.6667%", flex: "1 0 auto" }}>
      <div className="card hover-card h-100 w-100 m-0 rounded-0 d-flex flex-column">
        <div
          className="position-relative w-100 flex-grow-0 d-flex bg-secondary"
          style={{ aspectRatio: "2/3", overflow: "hidden" }}
        ></div>
        <div
          className="card-footer hover-footer border-top-0 rounded-0 p-0 d-flex justify-content-between align-items-center flex-shrink-0"
          style={{ height: "40px", minWidth: "100%" }}
        >
          <div className="d-flex h-100">
            <div
              className="btn check rounded-0 px-2 py-0 d-flex align-items-center justify-content-center bg-secondary"
              style={{ height: "100%", width: "30px", minWidth: "30px" }}
            ></div>
            <div
              className="btn bookmark rounded-0 px-2 py-0 d-flex align-items-center justify-content-center bg-secondary"
              style={{ height: "100%", width: "30px", minWidth: "30px" }}
            ></div>
          </div>
          <div className="d-flex align-items-center gap-1 pe-1">
            <div className="bg-secondary rounded" style={{ height: "16px", width: "16px" }}></div>
            <div className="bg-secondary rounded" style={{ height: "16px", width: "30px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
