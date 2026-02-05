export default function DynamicSearchResultSkeleton() {
  return (
    <div
      className="list-group-item list-group-item-action border-0 border-bottom rounded-0 p-0"
      style={{ height: "60px" }}
    >
      <div className="d-flex align-items-center">
        <div className="me-3 overflow-hidden" style={{ width: "40px", height: "60px", flexShrink: 0 }}>
          <div className="bg-secondary w-100 h-100"></div>
        </div>
        <div className="overflow-hidden pe-1 pt-1" style={{ height: "60px", width: "calc(100% - 50px)" }}>
          <div className="bg-secondary mb-1" style={{ height: "12px", width: "80%" }}></div>
          <div className="bg-secondary" style={{ height: "8px", width: "30%" }}></div>
        </div>
      </div>
    </div>
  );
}
