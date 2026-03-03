import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-(--background) flex flex-col selection:bg-(--muted) selection:text-(--foreground) relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--muted) blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--secondary) blur-3xl opacity-30 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-(--muted-bg) blur-3xl opacity-70" />
      </div>

      <Header />

      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
