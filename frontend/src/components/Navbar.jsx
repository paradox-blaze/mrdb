import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserFriends,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";

const ALL_USERS = ["Aneesh", "Anuj", "Alwin", "Dhanush", "Akshat", "BG"];

const navItems = [
  { name: "Movies", path: "/movies" },
  { name: "TV", path: "/tv" },
  { name: "Anime", path: "/anime" },
  { name: "Manga", path: "/manga" },
  { name: "Games", path: "/games" },
  { name: "Books", path: "/books" },
  { name: "Music", path: "/music" },
];

export default function Navbar({ onSearch }) {
  const { user: loggedInUser, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // FILTER LOGIC
  const otherUsers = ALL_USERS.filter((u) => u !== loggedInUser);

  // URL PARSING
  const pathParts = location.pathname.split("/");
  const isFriendView = pathParts[1] === "u";
  const currentViewedUser = isFriendView ? pathParts[2] : "Me";
  const currentCategory = pathParts[isFriendView ? 3 : 1] || "movies";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSearch(false);
    setQuery("");
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUserSwitch = (user) => {
    if (user === "Me") {
      navigate(`/${currentCategory}`);
    } else {
      navigate(`/u/${user}/${currentCategory}`);
    }
    setIsUserMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const getLink = (itemPath) => {
    if (isFriendView) return `/u/${currentViewedUser}${itemPath}`;
    return itemPath;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- LEFT: Logo & User Switcher --- */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hidden sm:block">
                MRDB
              </span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white bg-white/5 px-3 py-1.5 rounded-full transition-colors border border-white/5 hover:border-white/20"
              >
                <FaUserFriends className="text-primary" />
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {currentViewedUser === "Me"
                    ? `${loggedInUser || "My"}'s Collection`
                    : `${currentViewedUser}'s Collection`}
                </span>
                <FaChevronDown size={10} />
              </button>

              {/* DESKTOP DROPDOWN */}
              {isUserMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Switch Profile
                  </div>

                  {/* ME */}
                  <button
                    onClick={() => handleUserSwitch("Me")}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${currentViewedUser === "Me" ? "bg-accent" : "bg-gray-600"}`}
                    ></span>
                    {loggedInUser} (Me)
                  </button>

                  <div className="border-t border-white/10 my-1"></div>

                  {/* FRIENDS */}
                  {otherUsers.map((friend) => (
                    <button
                      key={friend}
                      onClick={() => handleUserSwitch(friend)}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${currentViewedUser === friend ? "bg-primary" : "bg-gray-600"}`}
                      ></span>
                      {friend}
                    </button>
                  ))}

                  <div className="border-t border-white/10 my-1"></div>

                  {/* LOGOUT BUTTON (DESKTOP) */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- CENTER: Desktop Links --- */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const targetLink = getLink(item.path);
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.name}
                  to={targetLink}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm transition-colors font-medium",
                    isActive
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* --- RIGHT: Search & Mobile Menu --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={clsx(
                "flex items-center transition-all duration-300",
                showSearch
                  ? "absolute top-16 left-0 w-full px-4 bg-background pb-4 border-b border-white/10 md:static md:w-auto md:p-0 md:bg-transparent md:border-none"
                  : "w-auto",
              )}
            >
              {showSearch ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative w-full md:w-64"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${currentViewedUser === "Me" ? "to add..." : "this list..."}`}
                    className="w-full bg-secondary/50 text-white pl-4 pr-10 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-accent placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="absolute right-3 top-2 mt-1.5 text-gray-400 hover:text-white"
                  >
                    <FaTimes size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <FaSearch />
                </button>
              )}
            </div>

            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white/5 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU (EXPANDED) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-white/10 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Nav Links */}
            {navItems.map((item) => {
              const targetLink = getLink(item.path);
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.name}
                  to={targetLink}
                  className={clsx(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    isActive
                      ? "bg-accent text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="border-t border-white/10 my-2"></div>

            {/* LOGOUT BUTTON (MOBILE) - ADDED HERE */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-md text-base font-bold flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
