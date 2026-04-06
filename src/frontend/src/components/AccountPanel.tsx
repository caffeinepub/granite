import {
  Check,
  Clock,
  Edit3,
  ImageIcon,
  LogOut,
  Mountain,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteDrawing,
  useGetMyDrawings,
  useGetProfile,
  useSaveDrawing,
  useSaveProfile,
} from "../hooks/useQueries";

interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  currentDrawingDataURL?: string;
}

// Helper to avoid inline assignment linting issue
function setElStyle(el: HTMLElement, styles: Record<string, string>) {
  for (const [key, val] of Object.entries(styles)) {
    (el.style as unknown as Record<string, string>)[key] = val;
  }
}

export default function AccountPanel({
  isOpen,
  onClose,
  onSignOut,
  currentDrawingDataURL: _currentDrawingDataURL,
}: AccountPanelProps) {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: drawings = [], isLoading: drawingsLoading } =
    useGetMyDrawings();
  const saveProfile = useSaveProfile();
  const saveDrawing = useSaveDrawing();
  const deleteDrawing = useDeleteDrawing();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingDrawingName, setSavingDrawingName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    if (profile?.displayName) setNameValue(profile.displayName);
  }, [profile?.displayName]);

  const displayName = profile?.displayName || "Granite Artist";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    try {
      await saveProfile.mutateAsync({ displayName: nameValue.trim() });
      toast.success("Name updated!");
      setIsEditingName(false);
    } catch {
      toast.error("Failed to save name");
    }
  };

  const handleSaveDrawing = async () => {
    if (!savingDrawingName.trim()) return;
    try {
      await saveDrawing.mutateAsync({
        id: BigInt(Date.now()),
        title: savingDrawingName.trim(),
        description: "",
        createdAt: BigInt(Date.now()),
        minutesSpent: BigInt(0),
      });
      toast.success("Drawing saved!");
      setShowSaveInput(false);
      setSavingDrawingName("");
    } catch {
      toast.error("Failed to save drawing");
    }
  };

  const handleDeleteDrawing = async (id: bigint) => {
    try {
      await deleteDrawing.mutateAsync(id);
      toast.success("Drawing deleted");
    } catch {
      toast.error("Failed to delete drawing");
    }
  };

  const btnHover = {
    enter: (e: React.MouseEvent<HTMLElement>) => {
      setElStyle(e.currentTarget as HTMLElement, { color: "#E8ECF0" });
    },
    leave: (e: React.MouseEvent<HTMLElement>) => {
      setElStyle(e.currentTarget as HTMLElement, { color: "#8A929C" });
    },
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 40,
        }}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-label="Close account panel"
        data-ocid="account.panel"
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "340px",
          background: "#22272E",
          borderLeft: "1px solid #363D47",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          animation: "slide-in-right 0.25s ease forwards",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #363D47",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#E8ECF0",
              margin: 0,
            }}
          >
            My Account
          </h2>
          <button
            type="button"
            data-ocid="account.close_button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8A929C",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={btnHover.enter}
            onMouseLeave={btnHover.leave}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {profileLoading ? (
            <div
              data-ocid="account.loading_state"
              style={{
                textAlign: "center",
                color: "#8A929C",
                padding: "40px 0",
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              {/* Avatar + name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "20px",
                  padding: "16px",
                  background: "#2A2F37",
                  borderRadius: "12px",
                  border: "1px solid #363D47",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4A9EFF, #2A7ED0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(74,158,255,0.3)",
                  }}
                >
                  {initials || "G"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditingName ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setIsEditingName(false);
                        }}
                        data-ocid="account.name.input"
                        style={{
                          flex: 1,
                          background: "#1A1F25",
                          border: "1px solid #4A9EFF",
                          borderRadius: "6px",
                          color: "#E8ECF0",
                          padding: "4px 8px",
                          fontSize: "0.875rem",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        data-ocid="account.name.save_button"
                        style={{
                          background: "#4A9EFF",
                          border: "none",
                          borderRadius: "6px",
                          color: "#fff",
                          cursor: "pointer",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        data-ocid="account.name.cancel_button"
                        style={{
                          background: "#363D47",
                          border: "none",
                          borderRadius: "6px",
                          color: "#8A929C",
                          cursor: "pointer",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        width: "100%",
                      }}
                      onClick={() => setIsEditingName(true)}
                      data-ocid="account.name.edit_button"
                    >
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          color: "#E8ECF0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayName}
                      </span>
                      <Edit3
                        size={12}
                        style={{ color: "#8A929C", flexShrink: 0 }}
                      />
                    </button>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "4px",
                    }}
                  >
                    <Mountain size={10} style={{ color: "#4A9EFF" }} />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#4A9EFF",
                        letterSpacing: "0.08em",
                      }}
                    >
                      GRANITE ARTIST
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "#2A2F37",
                    border: "1px solid #363D47",
                    borderRadius: "10px",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <ImageIcon size={16} style={{ color: "#4A9EFF" }} />
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "700",
                      color: "#E8ECF0",
                    }}
                  >
                    {drawings.length}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#8A929C",
                      marginTop: "2px",
                    }}
                  >
                    Total Drawings
                  </div>
                </div>
                <div
                  style={{
                    background: "#2A2F37",
                    border: "1px solid #363D47",
                    borderRadius: "10px",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <Clock size={16} style={{ color: "#4A9EFF" }} />
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "700",
                      color: "#E8ECF0",
                    }}
                  >
                    {drawings.reduce((s, d) => s + Number(d.minutesSpent), 0)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#8A929C",
                      marginTop: "2px",
                    }}
                  >
                    Minutes Creating
                  </div>
                </div>
              </div>

              {/* Save current drawing */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "0.75rem",
                    color: "#8A929C",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  Save Drawing
                </h3>
                {showSaveInput ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      value={savingDrawingName}
                      onChange={(e) => setSavingDrawingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveDrawing();
                        if (e.key === "Escape") setShowSaveInput(false);
                      }}
                      placeholder="Drawing name..."
                      data-ocid="account.drawing_name.input"
                      style={{
                        background: "#1A1F25",
                        border: "1px solid #363D47",
                        borderRadius: "8px",
                        color: "#E8ECF0",
                        padding: "8px 12px",
                        fontSize: "0.875rem",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#4A9EFF";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#363D47";
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        data-ocid="account.save_drawing.confirm_button"
                        onClick={handleSaveDrawing}
                        disabled={saveDrawing.isPending}
                        style={{
                          flex: 1,
                          height: "34px",
                          background: "#4A9EFF",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: saveDrawing.isPending
                            ? "not-allowed"
                            : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <Save size={12} />
                        {saveDrawing.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        data-ocid="account.save_drawing.cancel_button"
                        onClick={() => setShowSaveInput(false)}
                        style={{
                          height: "34px",
                          background: "#363D47",
                          border: "none",
                          borderRadius: "8px",
                          color: "#8A929C",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          padding: "0 12px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="account.save_drawing.open_modal_button"
                    onClick={() => setShowSaveInput(true)}
                    style={{
                      width: "100%",
                      height: "36px",
                      background: "#2A2F37",
                      border: "1px solid #363D47",
                      borderRadius: "8px",
                      color: "#8A929C",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      setElStyle(e.currentTarget as HTMLElement, {
                        background: "#343B44",
                        color: "#E8ECF0",
                      });
                    }}
                    onMouseLeave={(e) => {
                      setElStyle(e.currentTarget as HTMLElement, {
                        background: "#2A2F37",
                        color: "#8A929C",
                      });
                    }}
                  >
                    <Save size={13} />
                    Save Current Drawing
                  </button>
                )}
              </div>

              {/* Drawing history */}
              <div>
                <h3
                  style={{
                    fontSize: "0.75rem",
                    color: "#8A929C",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  Drawing History
                </h3>
                {drawingsLoading ? (
                  <div
                    data-ocid="account.drawings.loading_state"
                    style={{
                      color: "#8A929C",
                      fontSize: "0.8rem",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    Loading drawings...
                  </div>
                ) : drawings.length === 0 ? (
                  <div
                    data-ocid="account.drawings.empty_state"
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      color: "#8A929C",
                      fontSize: "0.8rem",
                    }}
                  >
                    <ImageIcon
                      size={28}
                      style={{
                        margin: "0 auto 8px",
                        display: "block",
                        opacity: 0.4,
                      }}
                    />
                    No drawings saved yet
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {drawings.map((d, i) => (
                      <div
                        key={d.id.toString()}
                        data-ocid={`account.drawings.item.${i + 1}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          background: "#2A2F37",
                          border: "1px solid #363D47",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            background: "#1A1F25",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ImageIcon size={14} style={{ color: "#4A9EFF" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.825rem",
                              color: "#E8ECF0",
                              fontWeight: "500",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {d.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              color: "#8A929C",
                              marginTop: "2px",
                            }}
                          >
                            {new Date(Number(d.createdAt)).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          data-ocid={`account.drawings.delete_button.${i + 1}`}
                          onClick={() => handleDeleteDrawing(d.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#8A929C",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            setElStyle(e.currentTarget as HTMLElement, {
                              color: "#E8594A",
                              background: "rgba(232,89,74,0.1)",
                            });
                          }}
                          onMouseLeave={(e) => {
                            setElStyle(e.currentTarget as HTMLElement, {
                              color: "#8A929C",
                              background: "transparent",
                            });
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer: Sign out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #363D47" }}>
          <button
            type="button"
            data-ocid="account.signout.button"
            onClick={onSignOut}
            style={{
              width: "100%",
              height: "40px",
              background: "rgba(232,89,74,0.1)",
              border: "1px solid rgba(232,89,74,0.2)",
              borderRadius: "10px",
              color: "#E8594A",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              setElStyle(e.currentTarget as HTMLElement, {
                background: "rgba(232,89,74,0.2)",
              });
            }}
            onMouseLeave={(e) => {
              setElStyle(e.currentTarget as HTMLElement, {
                background: "rgba(232,89,74,0.1)",
              });
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
