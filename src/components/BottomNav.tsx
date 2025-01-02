import { Home, Search, BookmarkIcon, User, Grid } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Grid, label: "Categories", path: "/categories" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: BookmarkIcon, label: "Saved", path: "/saved" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50 backdrop-blur-lg bg-opacity-90"
    >
      <nav className="max-w-lg mx-auto">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center p-2 transition-colors group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNav"
                      className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon
                    className={`w-6 h-6 ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    } transition-colors relative z-10`}
                  />
                  <span
                    className={`text-xs mt-1 relative z-10 ${
                      isActive
                        ? "text-blue-500 font-medium"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    } transition-colors`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );
};
