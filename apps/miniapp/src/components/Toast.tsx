import { CheckCircle2, AlertCircle, Bell } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { haptic } from "../lib/telegram";

type Kind = "success" | "error" | "info";
type Toast = { id: number; text: string; kind: Kind };

const ToastContext = createContext<(text: string, kind?: Kind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string, kind: Kind = "success") => {
    if (kind === "success") haptic.notify("success");
    if (kind === "error") haptic.notify("error");
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), text, kind });
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const Icon = toast?.kind === "error" ? AlertCircle : toast?.kind === "info" ? Bell : CheckCircle2;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-toast fixed left-1/2 top-3 z-[80] flex w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 items-center gap-2.5 rounded-[14px] bg-[#0d0d0d] px-4 py-3 text-[14px] text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
          onClick={() => setToast(null)}
        >
          <Icon
            className={`h-4.5 w-4.5 shrink-0 ${toast.kind === "error" ? "text-[#ff6b60]" : toast.kind === "success" ? "text-[#3ccf7d]" : "text-white/70"}`}
            strokeWidth={2}
          />
          <span className="leading-snug">{toast.text}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
