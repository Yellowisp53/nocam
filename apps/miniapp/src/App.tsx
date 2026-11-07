import { useEffect } from "react";
import { DemoBar, TabBar, tabsFor } from "./components/Chrome";
import { isOverdue, useStore } from "./data/store";
import { useNav } from "./lib/nav";
import { Attention } from "./screens/Attention";
import { Board } from "./screens/Board";
import { Cabinet, Member } from "./screens/Cabinet";
import { Categories } from "./screens/Categories";
import { ClientReview } from "./screens/ClientReview";
import { NewTask } from "./screens/NewTask";
import { Profile } from "./screens/Profile";
import { TaskDetail } from "./screens/TaskDetail";
import { Team } from "./screens/Team";

export default function App() {
  const { state, me } = useStore();
  const nav = useNav();

  // при смене пользователя — вкладка, которая есть у его роли
  useEffect(() => {
    if (!tabsFor(me.role).some((t) => t.id === nav.tab)) nav.setTab("board");
    else nav.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  const top = nav.stack[nav.stack.length - 1];
  const attention =
    me.role === "admin" ? state.tasks.filter((t) => t.column === "review" || isOverdue(t)).length : 0;

  let screen;
  if (top?.name === "task") screen = <TaskDetail id={top.id} />;
  else if (top?.name === "newTask") screen = <NewTask assigneeId={top.assigneeId} />;
  else if (top?.name === "client") screen = <ClientReview id={top.id} />;
  else if (top?.name === "member") screen = <Member id={top.id} />;
  else if (top?.name === "categories") screen = <Categories />;
  else if (nav.tab === "attention") screen = <Attention />;
  else if (nav.tab === "team") screen = <Team />;
  else if (nav.tab === "cabinet") screen = <Cabinet />;
  else if (nav.tab === "profile") screen = <Profile />;
  else screen = <Board />;

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col">
      <DemoBar />
      <main
        key={top ? `${top.name}-${"id" in top ? top.id : ""}` : nav.tab}
        className={`flex-1 ${!top && nav.tab === "board" ? "" : "mx-auto w-full max-w-[640px]"}`}
      >
        {screen}
      </main>
      {!top && <TabBar badges={{ attention }} />}
    </div>
  );
}
