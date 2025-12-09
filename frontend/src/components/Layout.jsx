import { Outlet, useOutletContext } from 'react-router-dom';
import Navbar from './Navbar';
import { useState } from 'react';

export default function Layout() {
	// We manage the search query state here at the top level
	// so we can pass it down to whatever page is currently active
	const [globalSearchQuery, setGlobalSearchQuery] = useState('');

	const handleSearch = (query) => {
		console.log("Searching for:", query);
		setGlobalSearchQuery(query);
	};

	return (
		<div className="min-h-screen bg-background text-text font-sans">
			<Navbar onSearch={handleSearch} />

			{/* Main Content - Added top padding so content isn't hidden behind fixed navbar */}
			<main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
				{/* We pass the search query context to the child pages */}
				<Outlet context={{ searchQuery: globalSearchQuery, clearSearch: () => setGlobalSearchQuery('') }} />
			</main>
		</div>
	);
}
