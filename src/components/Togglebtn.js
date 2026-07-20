import "../styles/Toggle.css";

export default function Toggle({ checked, label, onChange, labelOn = "On", labelOff = "Off" }) {
    return (
        <label className={`togg-group ${checked ? "togg-active" : ""}`}>
            <span className="togg-title">{label || ''}:</span>

            <span
                className={`togg-switch ${checked ? "togg-checked" : ""}`}
                onClick={onChange}
            >
                <span className="togg-knob" />
            </span>

            {/* <span className="togg-label">{checked ? labelOn : labelOff}</span> */}
        </label>
    );
}