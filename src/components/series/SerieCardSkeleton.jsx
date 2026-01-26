export default function SerieCardSkeleton() {
  return (
    <div className="col mb-4">
      <div className="card h-100 border-0 shadow-sm">
        <div className="bg-secondary rounded-top" style={{ height: "250px", width: "100%" }}></div>
        <div className="card-body p-3">
          <div className="bg-secondary rounded mb-2" style={{ height: "20px", width: "80%" }}></div>
        </div>
        <div className="card-footer bg-white border-top-0 p-3 d-flex justify-content-between align-items-center">
          <div className="bg-secondary rounded" style={{ height: "30px", width: "40%" }}></div>
          <div className="bg-secondary rounded" style={{ height: "15px", width: "20%" }}></div>
        </div>
      </div>
    </div>
  );
}
