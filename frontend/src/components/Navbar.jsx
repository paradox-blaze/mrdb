import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import clsx from 'clsx';

const navItems = [
	{ name: 'Movies', path: '/movies' },
	{ name: 'TV', path: '/tv' },
	{ name: 'Anime', path: '/anime' },
	{ name: 'Manga', path: '/manga' },
	{ name: 'Games', path: '/games' },
	{ name: 'Books', path: '/books' },
	{ name: 'Music', path: '/music' },
];

export default function Navbar({ onSearch }) {
	const [isOpen, setIsOpen] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [query, setQuery] = useState('');
	const location = useLocation();
	const navigate = useNavigate();

	// Close mobile menu when route changes
	useEffect(() => {
		setIsOpen(false);
		setShowSearch(false);
		setQuery('');
	}, [location.pathname]);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (query.trim()) {
			// Pass the query up to the parent or update URL params
			// We will simply pass it to a prop for now to handle the API call
			onSearch(query);
		}
	};

	const activeCategory = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Item';

	return (
		<nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">

					{/* Logo */}
					<div className="flex-shrink-0">
						<Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-wider">
							MRDB
						</Link>
					</div>

					{/* Desktop Links */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-4">
							{navItems.map((item) => {
								const isActive = location.pathname.startsWith(item.path);
								return (
									<Link
										key={item.name}
										to={item.path}
										className={clsx(
											"px-3 py-2 rounded-md text-sm font-medium transition-colors",
											isActive
												? "text-white bg-white/10"
												: "text-gray-300 hover:text-white hover:bg-white/5"
										)}
									>
										{item.name}
									</Link>
								);
							})}
						</div>
					</div>

					{/* Right Side: Search & Mobile Menu */}
					<div className="flex items-center gap-4">

						{/* Search Bar (Expandable) */}
						<div className={clsx("flex items-center transition-all duration-300", showSearch ? "w-full absolute top-16 left-0 px-4 bg-background pb-4 border-b border-white/10 md:static md:w-auto md:p-0 md:bg-transparent md:border-none" : "w-auto")}>
							{showSearch ? (
								<form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder={`Search ${activeCategory}...`}
										className="w-full bg-secondary/50 text-white pl-4 pr-10 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-accent"
										autoFocus
									/>
									<button type="button" onClick={() => setShowSearch(false)} className="absolute right-3 mt-1.5 top-1.5 text-gray-400 hover:text-white">
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

						{/* Mobile Menu Button */}
						<div className="-mr-2 flex md:hidden">
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
							>
								{isOpen ? <FaTimes /> : <FaBars />}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{isOpen && (
				<div className="md:hidden bg-background border-b border-white/10">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{navItems.map((item) => (
							<Link
								key={item.name}
								to={item.path}
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
							>
								{item.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
