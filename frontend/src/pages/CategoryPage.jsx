import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaPlus } from 'react-icons/fa';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../hooks/useAuth'; // <--- 1. IMPORT THIS

export default function CategoryPage({ type }) {
	const { searchQuery, clearSearch } = useOutletContext();
	const { user } = useAuth(); // <--- 2. GET LOGGED IN USER (e.g., "Anuj")
	const params = useParams();

	// LOGIC: 
	// If URL is /u/Alice, viewedUser is "Alice".
	// If URL is /movies, viewedUser is undefined, so we fallback to "user" (Anuj).
	// If user is null (not logged in), fallback to "Aneesh" (Default Admin).
	const viewedUser = params.username || user || "Aneesh";

	// "My Collection" is true only if the URL param is missing OR matches my name
	const isMyCollection = !params.username || params.username === user;

	const [savedReviews, setSavedReviews] = useState([]);
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);

	useEffect(() => {
		fetchSavedReviews();
	}, [type, viewedUser]); // Refetch if User changes (e.g. Anuj -> Alice)

	useEffect(() => {
		if (!searchQuery || !isMyCollection) {
			setSearchResults([]);
			return;
		}
		const delayDebounceFn = setTimeout(() => {
			fetchSearchResults();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery, type, isMyCollection]);

	async function fetchSavedReviews() {
		try {
			setLoading(true);
			// 3. EXPLICITLY REQUEST THE CORRECT USERNAME
			// This fixes the bug. We never leave it empty.
			const url = `/api/reviews?category=${type}&username=${viewedUser}`;

			const res = await axios.get(url);
			setSavedReviews(Array.isArray(res.data) ? res.data : []);
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
			setSearchResults(res.data || []);
		} catch (err) {
			setError("Failed to search. Try again.");
		} finally {
			setLoading(false);
		}
	}

	// Display Logic
	let itemsToDisplay = savedReviews;
	if (searchQuery) {
		if (isMyCollection) {
			itemsToDisplay = searchResults;
		} else {
			itemsToDisplay = savedReviews.filter(r =>
				r.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
	}

	return (
		<div className="animate-fade-in pb-20">
			{/* Header */}
			<div className="flex items-end justify-between border-b border-gray-800 pb-4 mb-8">
				<div>
					<h1 className="text-3xl md:text-4xl font-bold text-white capitalize tracking-tight flex items-center gap-3">
						{type === 'tv' ? 'TV Shows' : type}
						{/* Show Badge if viewing someone else */}
						{!isMyCollection && (
							<span className="text-lg md:text-2xl text-gray-400 font-normal">
								<span className="text-primary mx-2">/</span>
								{viewedUser}'s Collection
							</span>
						)}
					</h1>
					<p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">
						{searchQuery
							? `Searching ${isMyCollection ? 'Database' : viewedUser + "'s List"}...`
							: `${itemsToDisplay.length} items`}
					</p>
				</div>

				{searchQuery && (
					<button
						onClick={clearSearch}
						className="text-xs md:text-sm bg-secondary/30 hover:bg-secondary/50 text-primary px-4 py-2 rounded-full transition-colors"
					>
						Clear Search
					</button>
				)}
			</div>

			{/* Loading & Empty States */}
			{loading && (
				<div className="flex justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
				</div>
			)}

			{!loading && itemsToDisplay.length === 0 && (
				<div className="text-center py-20 opacity-50">
					<p className="text-xl">
						{searchQuery
							? "No results found."
							: isMyCollection
								? `Your ${type} collection is empty.`
								: `${viewedUser} hasn't reviewed any ${type} yet.`}
					</p>
				</div>
			)}

			{/* Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
				{!loading && itemsToDisplay.map((item) => (
					<div
						key={item._id || item.id}
						className="group relative bg-secondary/20 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg hover:shadow-accent/20"
						onClick={() => setSelectedItem(item)}
					>
						<div className="aspect-[2/3] w-full relative bg-gray-900">
							{item.image || item.posterUrl ? (
								<img src={item.image || item.posterUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">No Image</div>
							)}

							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								{isMyCollection && searchQuery ? (
									<span className="bg-accent text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm">
										<FaPlus /> Add
									</span>
								) : (
									<span className="text-accent font-bold text-lg">
										{isMyCollection ? 'Edit / View' : 'Read Review'}
									</span>
								)}
							</div>
						</div>

						<div className="p-3 md:p-4">
							<h3 className="text-white font-semibold truncate text-sm md:text-base">{item.title}</h3>
							<div className="flex justify-between items-center mt-2 text-xs md:text-sm text-gray-400">
								<span>{item.year || item.subtitle || 'N/A'}</span>
								{(item.overallScore !== undefined) && (
									<div className="flex items-center gap-1 text-yellow-400">
										<FaStar size={12} />
										<span className="font-bold text-white">{item.overallScore}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{selectedItem && (
				<ReviewModal
					item={selectedItem}
					category={type}
					readOnly={!isMyCollection}
					onClose={() => setSelectedItem(null)}
					onSave={() => { fetchSavedReviews(); clearSearch(); }}
				/>
			)}
		</div>
	);
}
