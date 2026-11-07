/** Навигация без роутер-библиотек: вкладка + стек экранов в состоянии */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Tab = "board" | "attention" | "team" | "cabinet" | "profile";

export type Route =
  | { name: "task"; id: string }
  | { name: "newTask" }
  | { name: "client"; id: string }
  | { name: "member"; id: string }
  | { name: "categories" };

type Nav = {
  tab: Tab;
  stack: Route[];
  setTab: (t: Tab) => void;
  push: (r: Route) => void;
  pop: () => void;
  reset: () => void;
};

const NavContext = createContext<Nav | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<Tab>("board");
  const [stack, setStack] = useState<Route[]>([]);

  const push = useCallback((r: Route) => {
    setStack((s) => [...s, r]);
    window.scrollTo({ top: 0 });
  }, []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const reset = useCallback(() => setStack([]), []);
  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    setStack([]);
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => ({ tab, stack, setTab, push, pop, reset }), [tab, stack, setTab, push, pop, reset]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const n = useContext(NavContext);
  if (!n) throw new Error("useNav вне NavProvider");
  return n;
}
