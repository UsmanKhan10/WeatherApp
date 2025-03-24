import { useState } from "react";
import "./App.css";
import WeatherFeature from "./Components/weatherLocation";
import Trails from "./Components/Trails";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "trails") navigate("/trails");
    if (selected === "home") navigate("/");
  };

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <header className="app-header">
        <label className="switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>

        <select className="feature-dropdown" onChange={handleFeatureChange}>
          <option value="">Select Feature</option>
          <option value="trails">Trails</option>
        </select>
      </header>

      {/* ✅ CONTROLLED ROUTING */}
      <Routes>
        <Route path="/" element={<WeatherFeature />} />
        <Route path="/trails" element={<Trails />} />
        <Route path="*" element={<WeatherFeature />} />
      </Routes>
    </div>
  );
}

export default App;
