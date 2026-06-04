import { useState } from "react";
import "../styles/StatusToggle.css";

export default function StatusToggle({ defaultActive = true, onChange }) {
  const [active, setActive] = useState(defaultActive);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onChange?.(next);
  };

  const stateClass = active ? "is-active" : "is-inactive";

  return (
    <div className="toggle-page">

      {/* ── Main pill button ── */}
      <button
        className={`st-btn ${stateClass}`}
        onClick={handleToggle}
        aria-pressed={active}
        aria-label={active ? "Active — click to set inactive" : "Inactive — click to set active"}
      >
        {/* Curved blue arc cap — slides left ↔ right via CSS */}
        <div className="st-arc">

        </div>

        {/* White inner pill with label */}
        <div className="st-inner">
          <span className="st-label">
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      </button>

    </div>
  );
}
