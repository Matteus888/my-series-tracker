export default function DynamicSearchResultSkeleton() {
  return (
    <div className="list-group-item list-group-item-action border-0 border-bottom p-0" style={{ height: "60px" }}>
      <div className="d-flex align-items-center">
        <div className="me-3" style={{ width: "40px", height: "60px", flexShrink: 0 }}>
          <div className="bg-secondary rounded" style={{ width: "100%", height: "100%" }}></div>
        </div>
        <div className="" style={{ height: "60px", width: "calc(100% - 50px)" }}>
          <div className="bg-secondary rounded mb-1" style={{ height: "16px", width: "80%" }}></div>
          <div className="bg-secondary rounded" style={{ height: "12px", width: "60%" }}></div>
        </div>
      </div>
    </div>
  );
}
