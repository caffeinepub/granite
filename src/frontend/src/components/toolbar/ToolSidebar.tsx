import {
  Brush,
  Circle,
  Droplets,
  Eraser,
  Minus,
  Pencil,
  Pipette,
  Square,
  Type,
} from "lucide-react";
import type { DrawingTool } from "../canvas/DrawingCanvas";
import ColorPanel from "./ColorPanel";

interface ToolSidebarProps {
  activeTool: DrawingTool;
  brushSize: number;
  opacity: number;
  color: string;
  recentColors: string[];
  fillShapes: boolean;
  onToolSelect: (tool: DrawingTool) => void;
  onBrushSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onColorChange: (color: string) => void;
  onFillShapesChange: (fill: boolean) => void;
}

interface ToolDef {
  id: DrawingTool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDef[] = [
  { id: "pencil", icon: <Pencil size={16} />, label: "Pencil", shortcut: "P" },
  { id: "brush", icon: <Brush size={16} />, label: "Brush", shortcut: "B" },
  { id: "eraser", icon: <Eraser size={16} />, label: "Eraser", shortcut: "E" },
  { id: "fill", icon: <Droplets size={16} />, label: "Fill", shortcut: "F" },
  {
    id: "rectangle",
    icon: <Square size={16} />,
    label: "Rectangle",
    shortcut: "R",
  },
  {
    id: "ellipse",
    icon: <Circle size={16} />,
    label: "Ellipse",
    shortcut: "C",
  },
  { id: "line", icon: <Minus size={16} />, label: "Line", shortcut: "L" },
  { id: "text", icon: <Type size={16} />, label: "Text", shortcut: "T" },
  {
    id: "eyedropper",
    icon: <Pipette size={16} />,
    label: "Eyedropper",
    shortcut: "I",
  },
];

export default function ToolSidebar({
  activeTool,
  brushSize,
  opacity,
  color,
  recentColors,
  fillShapes,
  onToolSelect,
  onBrushSizeChange,
  onOpacityChange,
  onColorChange,
  onFillShapesChange,
}: ToolSidebarProps) {
  return (
    <aside
      style={{
        width: "220px",
        background: "#22272E",
        borderRight: "1px solid #363D47",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Tool buttons */}
      <div
        style={{
          padding: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "4px",
          borderBottom: "1px solid #363D47",
        }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            data-ocid={`tool.${tool.id}.button`}
            className={`tool-btn ${activeTool === tool.id ? "active" : ""}`}
            style={{ width: "100%" }}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => onToolSelect(tool.id)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Tool options */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          borderBottom: "1px solid #363D47",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "#8A929C",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Size
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#E8ECF0",
                fontWeight: "600",
              }}
            >
              {brushSize}px
            </span>
          </div>
          <input
            data-ocid="tool.size.input"
            type="range"
            min={1}
            max={50}
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "#4A9EFF",
              height: "4px",
              cursor: "pointer",
            }}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "#8A929C",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Opacity
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#E8ECF0",
                fontWeight: "600",
              }}
            >
              {opacity}%
            </span>
          </div>
          <input
            data-ocid="tool.opacity.input"
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "#4A9EFF",
              height: "4px",
              cursor: "pointer",
            }}
          />
        </div>

        {(activeTool === "rectangle" || activeTool === "ellipse") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "#8A929C",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Fill Shape
            </span>
            <button
              type="button"
              data-ocid="tool.fill_shapes.toggle"
              onClick={() => onFillShapesChange(!fillShapes)}
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "10px",
                background: fillShapes ? "#4A9EFF" : "#363D47",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
              aria-label="Toggle fill shapes"
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: fillShapes ? "18px" : "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>
        )}
      </div>

      {/* Color panel */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <ColorPanel
          color={color}
          recentColors={recentColors}
          onColorChange={onColorChange}
        />
      </div>
    </aside>
  );
}
