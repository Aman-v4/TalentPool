import { useNavigate } from "react-router-dom";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { PortalMode } from "../../types";

export function PortalToggle() {
  const { portalMode, setPortalMode } = useTalentPool();
  const navigate = useNavigate();

  const switchPortal = (mode: PortalMode) => {
    setPortalMode(mode);
    navigate(mode === "client" ? "/talent-pools" : "/consultant");
  };

  return (
    <div className="flex rounded-full border border-ink-200 bg-ink-50 p-1">
      <button
        type="button"
        onClick={() => switchPortal("client")}
        className={`focus-ring rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
          portalMode === "client" ? "bg-ink-900 text-white shadow-soft" : "text-ink-600 hover:text-ink-900"
        }`}
      >
        Client
      </button>
      <button
        type="button"
        onClick={() => switchPortal("consultant")}
        className={`focus-ring rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
          portalMode === "consultant" ? "bg-ink-900 text-white shadow-soft" : "text-ink-600 hover:text-ink-900"
        }`}
      >
        Consultant
      </button>
    </div>
  );
}
