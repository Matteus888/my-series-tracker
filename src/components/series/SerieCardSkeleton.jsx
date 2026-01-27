export default function SerieCardSkeleton() {
  return (
    <div className="col p-0" style={{ minWidth: "16.6667%" }}>
      <div className="card h-100 border border-white">
        <div className="bg-secondary rounded-top" style={{ height: "250px", width: "100%" }}></div>
        <div className="card-body p-2">
          <div className="bg-secondary rounded mb-1" style={{ height: "16px", width: "80%" }}></div>
        </div>
        <div className="card-footer bg-white border-top border-white p-2 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <div className="bg-secondary rounded" style={{ height: "30px", width: "30px" }}></div>
            <div className="bg-secondary rounded" style={{ height: "30px", width: "30px" }}></div>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div className="bg-secondary rounded" style={{ height: "16px", width: "16px" }}></div>
            <div className="bg-secondary rounded" style={{ height: "16px", width: "30px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
