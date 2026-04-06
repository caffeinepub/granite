import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type DrawingTool =
  | "pencil"
  | "brush"
  | "eraser"
  | "fill"
  | "rectangle"
  | "ellipse"
  | "line"
  | "text"
  | "eyedropper";

export interface DrawingCanvasProps {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  opacity: number;
  showGrid: boolean;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  fillShapes?: boolean;
  onColorPicked?: (hex: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export interface DrawingCanvasHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getImageDataURL: () => string;
  loadImage: (src: string) => void;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const MAX_HISTORY = 50;

function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  size: number,
  colorStr: string,
  isEraser: boolean,
) {
  if (points.length < 2) {
    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? "#FFFFFF" : colorStr;
      ctx.fill();
    }
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.strokeStyle = isEraser ? "#FFFFFF" : colorStr;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shapeType: "rectangle" | "ellipse" | "line",
  start: { x: number; y: number },
  end: { x: number; y: number },
  fillColor: string,
  strokeSize: number,
  shouldFill: boolean,
) {
  ctx.beginPath();
  ctx.strokeStyle = fillColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = strokeSize;
  ctx.lineCap = "round";
  if (shapeType === "line") {
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else if (shapeType === "rectangle") {
    const w = end.x - start.x;
    const h = end.y - start.y;
    if (shouldFill) {
      ctx.fillRect(start.x, start.y, w, h);
    } else {
      ctx.strokeRect(start.x, start.y, w, h);
    }
  } else if (shapeType === "ellipse") {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const rx = Math.abs(end.x - start.x) / 2;
    const ry = Math.abs(end.y - start.y) / 2;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (shouldFill) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  (
    {
      tool,
      color,
      brushSize,
      opacity,
      showGrid,
      zoom,
      canvasWidth,
      canvasHeight,
      fillShapes = false,
      onColorPicked,
      onCursorMove,
      onHistoryChange,
    },
    ref,
  ) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const startPointRef = useRef<{ x: number; y: number } | null>(null);
    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef(-1);
    const pointsBufferRef = useRef<{ x: number; y: number }[]>([]);
    const [textInput, setTextInput] = useState<{
      x: number;
      y: number;
      visible: boolean;
    }>({ x: 0, y: 0, visible: false });
    const [textValue, setTextValue] = useState("");
    const textInputRef = useRef<HTMLInputElement>(null);

    const getCanvasCoords = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvasWidth / rect.width;
        const scaleY = canvasHeight / rect.height;
        return {
          x: Math.floor((e.clientX - rect.left) * scaleX),
          y: Math.floor((e.clientY - rect.top) * scaleY),
        };
      },
      [canvasWidth, canvasHeight],
    );

    const notifyHistory = useCallback(() => {
      onHistoryChange?.(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1,
      );
    }, [onHistoryChange]);

    const saveHistory = useCallback(() => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      historyRef.current = historyRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );
      historyRef.current.push(imageData);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      } else {
        historyIndexRef.current++;
      }
      notifyHistory();
    }, [canvasWidth, canvasHeight, notifyHistory]);

    const floodFill = useCallback(
      (startX: number, startY: number, fillColor: string) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        const startIdx = (startY * canvasWidth + startX) * 4;
        const startR = data[startIdx];
        const startG = data[startIdx + 1];
        const startB = data[startIdx + 2];
        const startA = data[startIdx + 3];

        const fillR = Number.parseInt(fillColor.slice(1, 3), 16);
        const fillG = Number.parseInt(fillColor.slice(3, 5), 16);
        const fillB = Number.parseInt(fillColor.slice(5, 7), 16);
        const fillA = Math.round((opacity / 100) * 255);

        if (
          startR === fillR &&
          startG === fillG &&
          startB === fillB &&
          startA === fillA
        )
          return;

        const colorMatch = (idx: number) =>
          data[idx] === startR &&
          data[idx + 1] === startG &&
          data[idx + 2] === startB &&
          data[idx + 3] === startA;

        const queue: number[] = [startY * canvasWidth + startX];
        const visited = new Uint8Array(canvasWidth * canvasHeight);
        visited[startY * canvasWidth + startX] = 1;

        while (queue.length > 0) {
          const pos = queue.shift()!;
          const x = pos % canvasWidth;
          const y = Math.floor(pos / canvasWidth);
          const idx = pos * 4;
          data[idx] = fillR;
          data[idx + 1] = fillG;
          data[idx + 2] = fillB;
          data[idx + 3] = fillA;

          const validNeighbors = [
            x > 0 ? pos - 1 : -1,
            x < canvasWidth - 1 ? pos + 1 : -1,
            y > 0 ? pos - canvasWidth : -1,
            y < canvasHeight - 1 ? pos + canvasWidth : -1,
          ];

          for (const n of validNeighbors) {
            if (n >= 0 && !visited[n] && colorMatch(n * 4)) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      },
      [canvasWidth, canvasHeight, opacity],
    );

    // Initialize canvas
    useEffect(() => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      // Reset history on size change
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveHistory();
    }, [canvasWidth, canvasHeight, saveHistory]);

    // Grid overlay
    useEffect(() => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      if (showGrid) {
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.5;
        const gridSize = 20;
        for (let x = 0; x <= canvasWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }
      }
    }, [showGrid, canvasWidth, canvasHeight]);

    useImperativeHandle(ref, () => ({
      undo() {
        const canvas = mainCanvasRef.current;
        if (!canvas || historyIndexRef.current <= 0) return;
        historyIndexRef.current--;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
        notifyHistory();
      },
      redo() {
        const canvas = mainCanvasRef.current;
        if (!canvas || historyIndexRef.current >= historyRef.current.length - 1)
          return;
        historyIndexRef.current++;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
        notifyHistory();
      },
      clear() {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        saveHistory();
      },
      getImageDataURL() {
        return mainCanvasRef.current?.toDataURL("image/png") ?? "";
      },
      loadImage(src: string) {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          saveHistory();
        };
        img.src = src;
      },
    }));

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button !== 0) return;
        const pos = getCanvasCoords(e);
        isDrawingRef.current = true;
        lastPointRef.current = pos;
        startPointRef.current = pos;
        pointsBufferRef.current = [pos];

        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (tool === "eyedropper") {
          const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
          const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
          onColorPicked?.(hex);
          isDrawingRef.current = false;
          return;
        }

        if (tool === "fill") {
          floodFill(pos.x, pos.y, color);
          saveHistory();
          isDrawingRef.current = false;
          return;
        }

        if (tool === "text") {
          const canvasRect = canvas.getBoundingClientRect();
          const displayX = e.clientX - canvasRect.left;
          const displayY = e.clientY - canvasRect.top;
          setTextInput({ x: displayX, y: displayY, visible: true });
          setTextValue("");
          setTimeout(() => textInputRef.current?.focus(), 50);
          isDrawingRef.current = false;
          return;
        }

        if (tool === "pencil" || tool === "brush" || tool === "eraser") {
          ctx.globalAlpha = opacity / 100;
          const colorStr = hexToRgba(color, opacity);
          drawSmoothLine(ctx, [pos], brushSize, colorStr, tool === "eraser");
        }
      },
      [
        tool,
        color,
        brushSize,
        opacity,
        floodFill,
        saveHistory,
        getCanvasCoords,
        onColorPicked,
      ],
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasCoords(e);
        onCursorMove?.(pos.x, pos.y);

        if (!isDrawingRef.current) return;

        const canvas = mainCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!canvas || !overlayCanvas) return;
        const ctx = canvas.getContext("2d");
        const overlayCtx = overlayCanvas.getContext("2d");
        if (!ctx || !overlayCtx) return;

        if (tool === "pencil" || tool === "brush" || tool === "eraser") {
          pointsBufferRef.current.push(pos);
          ctx.globalAlpha = tool === "eraser" ? 1 : opacity / 100;
          const colorStr = hexToRgba(color, opacity);
          drawSmoothLine(
            ctx,
            pointsBufferRef.current,
            tool === "brush" ? brushSize * 1.5 : brushSize,
            colorStr,
            tool === "eraser",
          );
          if (pointsBufferRef.current.length > 3) {
            pointsBufferRef.current = pointsBufferRef.current.slice(-2);
          }
          ctx.globalAlpha = 1;
        } else if (
          tool === "rectangle" ||
          tool === "ellipse" ||
          tool === "line"
        ) {
          const start = startPointRef.current;
          if (!start) return;
          overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          overlayCtx.globalAlpha = opacity / 100;
          drawShape(
            overlayCtx,
            tool as "rectangle" | "ellipse" | "line",
            start,
            pos,
            color,
            brushSize,
            fillShapes,
          );
          overlayCtx.globalAlpha = 1;
        }

        lastPointRef.current = pos;
      },
      [
        tool,
        color,
        brushSize,
        opacity,
        fillShapes,
        getCanvasCoords,
        onCursorMove,
        canvasWidth,
        canvasHeight,
      ],
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        const pos = getCanvasCoords(e);
        const canvas = mainCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!canvas || !overlayCanvas) return;
        const ctx = canvas.getContext("2d");
        const overlayCtx = overlayCanvas.getContext("2d");
        if (!ctx || !overlayCtx) return;

        if (tool === "rectangle" || tool === "ellipse" || tool === "line") {
          const start = startPointRef.current;
          if (start) {
            ctx.globalAlpha = opacity / 100;
            drawShape(
              ctx,
              tool as "rectangle" | "ellipse" | "line",
              start,
              pos,
              color,
              brushSize,
              fillShapes,
            );
            ctx.globalAlpha = 1;
            overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          }
        }

        ctx.globalAlpha = 1;
        pointsBufferRef.current = [];
        saveHistory();
      },
      [
        tool,
        color,
        brushSize,
        opacity,
        fillShapes,
        getCanvasCoords,
        saveHistory,
        canvasWidth,
        canvasHeight,
      ],
    );

    const handleMouseLeave = useCallback(() => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        pointsBufferRef.current = [];
        const mainCtx = mainCanvasRef.current?.getContext("2d");
        if (mainCtx) mainCtx.globalAlpha = 1;
        saveHistory();
      }
    }, [saveHistory]);

    const commitText = useCallback(() => {
      if (!textValue.trim()) {
        setTextInput((p) => ({ ...p, visible: false }));
        return;
      }
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const canvasRect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / canvasRect.width;
      const scaleY = canvasHeight / canvasRect.height;
      const cx = textInput.x * scaleX;
      const cy = textInput.y * scaleY;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      ctx.font = `${brushSize * 3 + 10}px system-ui, sans-serif`;
      ctx.fillText(textValue, cx, cy);
      ctx.globalAlpha = 1;
      setTextInput((p) => ({ ...p, visible: false }));
      setTextValue("");
      saveHistory();
    }, [
      textValue,
      color,
      opacity,
      brushSize,
      textInput,
      canvasWidth,
      canvasHeight,
      saveHistory,
    ]);

    const getCursor = () => {
      switch (tool) {
        case "pencil":
          return "crosshair";
        case "brush":
          return "crosshair";
        case "eraser":
          return "cell";
        case "fill":
          return "cell";
        case "text":
          return "text";
        case "eyedropper":
          return "crosshair";
        default:
          return "crosshair";
      }
    };

    return (
      <div
        style={{
          position: "relative",
          width: canvasWidth * (zoom / 100),
          height: canvasHeight * (zoom / 100),
          display: "inline-block",
        }}
      >
        <canvas
          ref={mainCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: canvasWidth * (zoom / 100),
            height: canvasHeight * (zoom / 100),
            cursor: getCursor(),
            background: "#FFFFFF",
            boxShadow:
              "0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          data-ocid="canvas.canvas_target"
        />
        <canvas
          ref={overlayCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: canvasWidth * (zoom / 100),
            height: canvasHeight * (zoom / 100),
            pointerEvents: "none",
          }}
        />
        {textInput.visible && (
          <input
            ref={textInputRef}
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape")
                setTextInput((p) => ({ ...p, visible: false }));
            }}
            onBlur={commitText}
            data-ocid="canvas.input"
            style={{
              position: "absolute",
              left: textInput.x * (zoom / 100),
              top: textInput.y * (zoom / 100),
              background: "rgba(255,255,255,0.9)",
              border: "1px dashed #4A9EFF",
              borderRadius: "2px",
              padding: "2px 4px",
              color: color,
              fontSize: `${(brushSize * 3 + 10) * (zoom / 100)}px`,
              outline: "none",
              minWidth: "80px",
              zIndex: 10,
            }}
          />
        )}
      </div>
    );
  },
);

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
