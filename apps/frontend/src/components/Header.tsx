import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, LogOut, LayoutDashboard, Users, ListOrdered } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = (() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      show: true,
    },
    {
      label: "Cause List",
      icon: ListOrdered,
      path: "/cause-list",
      show: true,
    },
    {
      label: "Search Cases",
      icon: Search,
      path: "/search",
      show: true,
    },
    {
      label: "Admin",
      icon: Users,
      path: "/admin/users",
      show: currentUser?.role === "ADMIN",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="px-4 md:px-12 py-4 md:py-5 flex justify-between items-center relative z-20 w-full backdrop-blur-md border-b border-(--muted)/40 bg-white/20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 md:gap-4 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div>
          <h1 className="font-serif-logo text-xl md:text-3xl font-bold tracking-normal text-(--foreground) leading-none mb-0.5 md:mb-1">
            JAPSEHAJ SINGH
          </h1>
          <p className="text-[9px] md:text-xs text-(--secondary) font-bold tracking-[0.2em] uppercase">
            Legal Office
          </p>
        </div>
      </motion.div>

      {/* Navigation + Logout */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-1 md:gap-3"
      >
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 text-sm font-semibold transition-all px-3 md:px-4 py-2 rounded-full border border-transparent ${
                  active
                    ? "bg-(--primary)/15 text-(--primary) border-(--primary)/30"
                    : "text-(--secondary) hover:text-(--primary) hover:bg-(--primary)/10 hover:border-(--primary)/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-(--muted)/60 mx-1" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 text-sm font-semibold text-(--foreground) transition-all border-2 border-(--muted) px-3 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-(--muted)/30 hover:shadow-md hover:-translate-y-0.5"
        >
          <span className="hidden sm:inline">Sign Out</span>
          <LogOut className="w-4 h-4 text-(--secondary) group-hover:text-(--foreground) transition-colors" />
        </button>
      </motion.div>
    </header>
  );
}
