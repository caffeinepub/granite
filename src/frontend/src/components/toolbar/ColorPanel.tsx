import { useRef } from "react";

const PALETTE = [
  // Neutrals
  "#000000",
  "#1A1A1A",
  "#333333",
  "#4D4D4D",
  "#666666",
  // Light grays / white
  "#808080",
  "#999999",
  "#B3B3B3",
  "#CCCCCC",
  "#FFFFFF",
  // Reds
  "#8B0000",
  "#CC0000",
  "#FF0000",
  "#FF4444",
  "#FF8888",
  // Warm
  "#FF6600",
  "#FF8C00",
  "#FFB300",
  "#FFD700",
  "#FFFACD",
  // Greens
  "#004400",
  "#006600",
  "#00AA00",
  "#44BB44",
  "#99EE99",
  // Blues
  "#000080",
  "#0044CC",
  "#4A9EFF",
  "#88BBFF",
  "#CCE4FF",
  // Purples/pinks
  "#440044",
  "#880088",
  "#CC44CC",
  "#FF66FF",
  "#FFBBFF",
  // Browns
  "#4A1F00",
  "#8B4513",
  "#A0522D",
  "#CD853F",
  "#DEB887",
  // Teals
  "#003333",
  "#006666",
  "#008080",
  "#20B2AA",
  "#7FFFD4",
  // Mixed
  "#2D1B69",
  "#5C35CC",
  "#9B59B6",
  "#E74C3C",
  "#F39C12",
];

interface ColorPanelProps {
  color: string;
  recentColors: string[];
  onColorChange: (color: string) => void;
}

export default function ColorPanel({
  color,
  recentColors,
  onColorChange,
}: ColorPanelProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onColorChange(val);
    }
  };

  const label = (text: string) => (
    <p
      style={{
        fontSize: "0.65rem",
        color: "#8A929C",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        margin: "0 0 6px",
      }}
    >
      {text}
    </p>
  );

  return (
    <div
      style={{
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Current color + picker */}
      <div>
        {label("Active Color")}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: color,
              border: "2px solid #363D47",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              padding: 0,
            }}
            onClick={() => colorInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                colorInputRef.current?.click();
            }}
            aria-label="Open color picker"
            data-ocid="color.primary.button"
          />
          <input
            type="text"
            defaultValue={color}
            key={color}
            onChange={handleHexInput}
            data-ocid="color.hex.input"
            style={{
              flex: 1,
              height: "28px",
              background: "#1A1F25",
              border: "1px solid #363D47",
              borderRadius: "6px",
              color: "#E8ECF0",
              padding: "0 8px",
              fontSize: "0.75rem",
              fontFamily: "monospace",
              outline: "none",
            }}
            placeholder="#000000"
            maxLength={7}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            data-ocid="color.picker.input"
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              position: "absolute",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Palette */}
      <div>
        {label("Palette")}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: "2px",
          }}
        >
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? "active" : ""}`}
              style={{
                background: c,
                width: "16px",
                height: "16px",
                padding: 0,
              }}
              onClick={() => onColorChange(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onColorChange(c);
              }}
              aria-label={`Select color ${c}`}
              title={c}
              data-ocid="color.swatch.button"
            />
          ))}
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div>
          {label("Recent")}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {recentColors.slice(0, 8).map((c) => (
              <button
                key={c}
                type="button"
                className="color-swatch"
                style={{ background: c }}
                onClick={() => onColorChange(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onColorChange(c);
                }}
                aria-label={`Select recent color ${c}`}
                title={c}
                data-ocid="color.recent.button"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
