import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AccountPanel from "./AccountPanel";
import DrawingCanvas, {
  type DrawingCanvasHandle,
  type DrawingTool,
} from "./canvas/DrawingCanvas";
import ToolSidebar from "./toolbar/ToolSidebar";
import TopBar from "./toolbar/TopBar";

interface DrawingAppProps {
  onSignOut: () => void;
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300];

export default function DrawingApp({ onSignOut }: DrawingAppProps) {
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const [tool, setTool] = useState<DrawingTool>("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [fillShapes, setFillShapes] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [canvasWidth] = useState(800);
  const [canvasHeight] = useState(600);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showAccount, setShowAccount] = useState(false);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== newColor);
      return [newColor, ...filtered].slice(0, 8);
    });
  }, []);

  const handleUndo = useCallback(() => canvasRef.current?.undo(), []);
  const handleRedo = useCallback(() => canvasRef.current?.redo(), []);
  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    toast.success("Canvas cleared");
  }, []);

  const handleSavePNG = useCallback(() => {
    const dataURL = canvasRef.current?.getImageDataURL();
    if (!dataURL) return;
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `granite-${Date.now()}.png`;
    a.click();
    toast.success("Image downloaded!");
  }, []);

  const handleOpen = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    canvasRef.current?.loadImage(url);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success(`Opened: ${file.name}`);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.findIndex((l) => l >= z);
      return ZOOM_LEVELS[Math.min(idx + 1, ZOOM_LEVELS.length - 1)];
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.findIndex((l) => l >= z);
      return ZOOM_LEVELS[Math.max(idx - 1, 0)];
    });
  }, []);

  const handleZoomReset = useCallback(() => setZoom(100), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
          case "s":
            e.preventDefault();
            handleSavePNG();
            break;
          case "n":
            e.preventDefault();
            handleClear();
            break;
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "p":
          setTool("pencil");
          break;
        case "b":
          setTool("brush");
          break;
        case "e":
          setTool("eraser");
          break;
        case "f":
          setTool("fill");
          break;
        case "r":
          setTool("rectangle");
          break;
        case "c":
          setTool("ellipse");
          break;
        case "l":
          setTool("line");
          break;
        case "t":
          setTool("text");
          break;
        case "i":
          setTool("eyedropper");
          break;
        case "[":
          setBrushSize((s) => Math.max(1, s - 1));
          break;
        case "]":
          setBrushSize((s) => Math.min(50, s + 1));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleSavePNG, handleClear]);

  const toolNames: Record<DrawingTool, string> = {
    pencil: "Pencil",
    brush: "Brush",
    eraser: "Eraser",
    fill: "Fill",
    rectangle: "Rectangle",
    ellipse: "Ellipse",
    line: "Line",
    text: "Text",
    eyedropper: "Eyedropper",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#1A1F25",
        overflow: "hidden",
      }}
    >
      <TopBar
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        showGrid={showGrid}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNew={handleClear}
        onOpen={handleOpen}
        onSave={handleSavePNG}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onToggleGrid={() => setShowGrid((g) => !g)}
        onToggleAccount={() => setShowAccount((a) => !a)}
        onSignOut={onSignOut}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <ToolSidebar
          activeTool={tool}
          brushSize={brushSize}
          opacity={opacity}
          color={color}
          recentColors={recentColors}
          fillShapes={fillShapes}
          onToolSelect={setTool}
          onBrushSizeChange={setBrushSize}
          onOpacityChange={setOpacity}
          onColorChange={handleColorChange}
          onFillShapesChange={setFillShapes}
        />

        {/* Canvas area */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "24px",
            background: "#1A1F25",
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(74,158,255,0.03) 0%, transparent 60%)",
            minWidth: 0,
          }}
          data-ocid="canvas.section"
        >
          <DrawingCanvas
            ref={canvasRef}
            tool={tool}
            color={color}
            brushSize={brushSize}
            opacity={opacity}
            showGrid={showGrid}
            zoom={zoom}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            fillShapes={fillShapes}
            onColorPicked={handleColorChange}
            onCursorMove={(x, y) => setCursorPos({ x, y })}
            onHistoryChange={(undo, redo) => {
              setCanUndo(undo);
              setCanRedo(redo);
            }}
          />
        </main>
      </div>

      {/* Status bar */}
      <footer
        style={{
          height: "28px",
          background: "#22272E",
          borderTop: "1px solid #363D47",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "16px",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "0.68rem", color: "#8A929C" }}>
          X: {cursorPos.x} Y: {cursorPos.y}
        </span>
        <span style={{ fontSize: "0.68rem", color: "#363D47" }}>|</span>
        <span style={{ fontSize: "0.68rem", color: "#8A929C" }}>
          {canvasWidth} × {canvasHeight}px
        </span>
        <span style={{ fontSize: "0.68rem", color: "#363D47" }}>|</span>
        <span style={{ fontSize: "0.68rem", color: "#8A929C" }}>
          Zoom: {zoom}%
        </span>
        <span style={{ fontSize: "0.68rem", color: "#363D47" }}>|</span>
        <span style={{ fontSize: "0.68rem", color: "#4A9EFF" }}>
          {toolNames[tool]}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "0.68rem", color: "#4A5568" }}>
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4A9EFF", textDecoration: "none" }}
          >
            caffeine.ai
          </a>
        </span>
      </footer>

      <AccountPanel
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
        onSignOut={onSignOut}
        currentDrawingDataURL={canvasRef.current?.getImageDataURL()}
      />
    </div>
  );
}
