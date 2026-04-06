import {
  Download,
  FolderOpen,
  Grid,
  LogOut,
  Mountain,
  Plus,
  Redo2,
  Undo2,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  showGrid: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
  onOpen: (file: File) => void;
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleGrid: () => void;
  onToggleAccount: () => void;
  onSignOut: () => void;
}

const BTN =
  "flex items-center justify-center gap-1.5 px-2.5 h-8 rounded text-xs font-medium transition-all";
const ICON_BTN =
  "flex items-center justify-center w-8 h-8 rounded transition-all";

function setElStyle(el: HTMLElement, styles: Record<string, string>) {
  for (const [key, val] of Object.entries(styles)) {
    (el.style as unknown as Record<string, string>)[key] = val;
  }
}

export default function TopBar({
  canUndo,
  canRedo,
  zoom,
  showGrid,
  onUndo,
  onRedo,
  onNew,
  onOpen,
  onSave,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleGrid,
  onToggleAccount,
  onSignOut,
}: TopBarProps) {
  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onOpen(file);
    e.target.value = "";
  };

  const btnStyle = (active = false, disabled = false): React.CSSProperties => ({
    background: active ? "#1E3A5F" : "transparent",
    border: active ? "1px solid #4A9EFF" : "1px solid transparent",
    color: disabled ? "#4A5568" : active ? "#4A9EFF" : "#8A929C",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  const makeHover = (disabled = false) => {
    if (disabled) return {};
    return {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget as HTMLElement;
        if (!el.style.borderColor?.includes("4A9EFF")) {
          setElStyle(el, { background: "#343B44", color: "#E8ECF0" });
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget as HTMLElement;
        if (!el.style.borderColor?.includes("4A9EFF")) {
          setElStyle(el, { background: "transparent", color: "#8A929C" });
        }
      },
    };
  };

  return (
    <header
      style={{
        height: "48px",
        background: "#22272E",
        borderBottom: "1px solid #363D47",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: "4px",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginRight: "12px",
          paddingRight: "12px",
          borderRight: "1px solid #363D47",
          minWidth: "120px",
        }}
      >
        <Mountain size={18} style={{ color: "#4A9EFF" }} />
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: "700",
            letterSpacing: "0.15em",
            color: "#E8ECF0",
          }}
        >
          GRANITE
        </span>
      </div>

      {/* File actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <button
          type="button"
          data-ocid="topbar.new.button"
          className={BTN}
          style={btnStyle()}
          title="New Canvas (Ctrl+N)"
          onClick={onNew}
          {...makeHover()}
        >
          <Plus size={14} />
          <span>New</span>
        </button>

        <label
          data-ocid="topbar.open.button"
          className={BTN}
          style={{ ...btnStyle(), cursor: "pointer" }}
          {...makeHover()}
        >
          <FolderOpen size={14} />
          <span>Open</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileOpen}
            style={{ display: "none" }}
          />
        </label>

        <button
          type="button"
          data-ocid="topbar.save.button"
          className={BTN}
          style={btnStyle()}
          title="Save PNG (Ctrl+S)"
          onClick={onSave}
          {...makeHover()}
        >
          <Download size={14} />
          <span>Save</span>
        </button>
      </div>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "24px",
          background: "#363D47",
          margin: "0 6px",
        }}
      />

      {/* History */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <button
          type="button"
          data-ocid="topbar.undo.button"
          className={ICON_BTN}
          style={btnStyle(false, !canUndo)}
          title="Undo (Ctrl+Z)"
          onClick={canUndo ? onUndo : undefined}
          disabled={!canUndo}
          {...makeHover(!canUndo)}
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          data-ocid="topbar.redo.button"
          className={ICON_BTN}
          style={btnStyle(false, !canRedo)}
          title="Redo (Ctrl+Y)"
          onClick={canRedo ? onRedo : undefined}
          disabled={!canRedo}
          {...makeHover(!canRedo)}
        >
          <Redo2 size={15} />
        </button>
      </div>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "24px",
          background: "#363D47",
          margin: "0 6px",
        }}
      />

      {/* Zoom */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <button
          type="button"
          data-ocid="topbar.zoom_out.button"
          className={ICON_BTN}
          style={btnStyle()}
          title="Zoom Out"
          onClick={onZoomOut}
          {...makeHover()}
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          data-ocid="topbar.zoom_reset.button"
          style={{
            ...btnStyle(),
            minWidth: "52px",
            height: "28px",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: "600",
            padding: "0 8px",
            cursor: "pointer",
          }}
          title="Reset Zoom"
          onClick={onZoomReset}
          {...makeHover()}
        >
          {zoom}%
        </button>
        <button
          type="button"
          data-ocid="topbar.zoom_in.button"
          className={ICON_BTN}
          style={btnStyle()}
          title="Zoom In"
          onClick={onZoomIn}
          {...makeHover()}
        >
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "24px",
          background: "#363D47",
          margin: "0 6px",
        }}
      />

      {/* Grid */}
      <button
        type="button"
        data-ocid="topbar.grid.toggle"
        className={ICON_BTN}
        style={btnStyle(showGrid)}
        title="Toggle Grid"
        onClick={onToggleGrid}
        {...makeHover()}
      >
        <Grid size={15} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          type="button"
          data-ocid="topbar.account.button"
          className={BTN}
          style={{ ...btnStyle(), gap: "6px" }}
          title="My Account"
          onClick={onToggleAccount}
          {...makeHover()}
        >
          <User size={14} />
          <span>Account</span>
        </button>

        <button
          type="button"
          data-ocid="topbar.signout.button"
          className={ICON_BTN}
          style={{ ...btnStyle(), color: "#8A929C" }}
          title="Sign Out"
          onClick={onSignOut}
          onMouseEnter={(e) => {
            setElStyle(e.currentTarget as HTMLElement, {
              background: "rgba(232,89,74,0.15)",
              color: "#E8594A",
            });
          }}
          onMouseLeave={(e) => {
            setElStyle(e.currentTarget as HTMLElement, {
              background: "transparent",
              color: "#8A929C",
            });
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
