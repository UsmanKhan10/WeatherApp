import { useNavigate } from "react-router-dom";

export default function Trails() {
  const navigate = useNavigate();

  return (
    <div className="trails-page">
      <h1>🚶 Trails Feature Page</h1>
      <p>Here you can explore various trails and paths!</p>

      {/* ✅ Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Back to Home
      </button>
    </div>
  );
}
