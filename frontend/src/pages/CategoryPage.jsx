// frontend/src/pages/CategoryPage.jsx
import ReviewModal from '../components/ReviewModal'
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import clsx from 'clsx';
import { FaStar, FaPlus } from 'react-icons/fa';

export default function CategoryPage({ type }) {
	const { searchQuery, clearSearch } = useOutletContext();
	const [selectedItem, setSelectedItem] = useState(null);
	const [savedReviews, setSavedReviews] = useState([]);
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const isLoggedIn = !!localStorage.getItem('token');
	// 1. Fetch Saved Reviews (Collection) on Load
	useEffect(() => {
		fetchSavedReviews();
	}, [type]); // Re-fetch if category changes

	// 2. Fetch Search Results when query changes
	useEffect(() => {
		if (!searchQuery) {
			setSearchResults([]); // Clear results if search is cleared
			return;
		}

		const delayDebounceFn = setTimeout(() => {
			fetchSearchResults();
		}, 500); // 500ms delay so we don't spam the API while typing

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery, type]);

	async function fetchSavedReviews() {
		try {
			setLoading(true);
			const res = await axios.get(`/api/reviews?category=${type}`);
			setSavedReviews(res.data);
		} catch (err) {
			console.error("Failed to fetch reviews", err);
		} finally {
			setLoading(false);
		}
	}

	async function fetchSearchResults() {
		try {
			setLoading(true);
			setError(null);
			const res = await axios.get(`/api/search?type=${type}&q=${searchQuery}`);

			console.log("Search API Response:", res.data); // <--- Add this!

			// If the API returns { results: [...] } instead of directly [...]
			if (res.data && res.data.results) {
				setSearchResults(res.data.results);
			} else {
				setSearchResults(res.data);
			}
		} catch (err) {
			console.error(err);
			setError("Failed to search. Try again.");
			setSearchResults([]); // Ensure it resets to array on error
		} finally {
			setLoading(false);
		}
	}

	// Helper to choose which list to show
	const isSearching = !!searchQuery;
	const rawData = isSearching ? searchResults : savedReviews;
	const itemsToDisplay = Array.isArray(rawData) ? rawData : [];

	return (
		<div className="animate-fade-in">
			{/* Header */}
			<div className="flex items-end justify-between border-b border-gray-800 pb-4 mb-8">
				<div>
					<h1 className="text-4xl font-bold text-white capitalize tracking-tight">
						{type === 'tv' ? 'TV Shows' : type}
					</h1>
					<p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">
						{isSearching ? `Results for "${searchQuery}"` : 'My Collection'}
					</p>
				</div>

				{isSearching && (
					<button
						onClick={clearSearch}
						className="text-sm bg-secondary/30 hover:bg-secondary/50 text-primary px-4 py-2 rounded-full transition-colors"
					>
						Clear Search
					</button>
				)}
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
				</div>
			)}

			{/* Error State */}
			{error && <div className="text-red-400 text-center py-10">{error}</div>}

			{/* Empty State */}
			{!loading && itemsToDisplay.length === 0 && (
				<div className="text-center py-20 opacity-50">
					<p className="text-xl">
						{isSearching
							? "No results found."
							: "Your collection is empty. Search above to add one!"}
					</p>
				</div>
			)}

			{/* Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
				{!loading && itemsToDisplay.map((item) => (
					<div
						key={item.id || item._id}
						className="group relative bg-secondary/20 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg hover:shadow-accent/20"
						onClick={() => setSelectedItem(item)} // We will replace this with the Modal later!
					>
						{/* Poster Image */}
						<div className="aspect-[2/3] w-full relative bg-gray-900">
							{item.image || item.posterUrl ? (
								<img
									src={item.image || item.posterUrl}
									alt={item.title}
									className="w-full h-full object-cover"
									loading="lazy"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xl">
									No Image
								</div>
							)}

							{/* Overlay on Hover */}
							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								{isSearching ? (
									isLoggedIn ? (
										<span className="bg-accent text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
											<FaPlus /> Add Review
										</span>
									) : (<span className="bg-gray-700 text-gray-300 px-4 py-2 rounded-full font-bold text-sm">Login to Add</span>)
								) : (
									<span className="text-accent font-bold text-lg">View Details</span>
								)}
							</div>
						</div>

						{/* Content Info */}
						<div className="p-4">
							<h3 className="text-white font-semibold truncate" title={item.title}>
								{item.title}
							</h3>

							<div className="flex justify-between items-center mt-2 text-sm text-gray-400">
								<span>{item.year || item.subtitle || 'N/A'}</span>

								{/* Show Score only if it's a saved review */}
								{!isSearching && item.overallScore && (
									<div className="flex items-center gap-1 text-yellow-400">
										<FaStar />
										<span className="font-bold text-white">{item.overallScore}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
			{/* Modal - only shows when selectedItem is not null */}
			{selectedItem && (
				<ReviewModal
					item={selectedItem}
					category={type}
					onClose={() => setSelectedItem(null)}
					onSave={() => {
						// Refresh reviews and clear search so we see the new addition
						fetchSavedReviews();
						clearSearch();
					}}
				/>
			)}
		</div> // Closing main div
	);
} 
