// frontend/src/components/ReviewModal.jsx
import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa'; // Added Trash Icon
import axios from 'axios';

const CRITERIA = {
	movie: ['Plot', 'Characters', 'Music', 'Cinematography', 'Enjoyment'],
	tv: ['Plot', 'Characters', 'Music', 'Visuals', 'Pacing'],
	anime: ['Story', 'Animation', 'Sound', 'Characters', 'Enjoyment'],
	game: ['Gameplay', 'Graphics', 'Story', 'Music', 'Fun Factor'],
	book: ['Story', 'Characters', 'Writing Style', 'Pacing', 'Impact'],
	manga: ['Story', 'Art', 'Characters', 'Flow', 'Enjoyment'],
	music: ['Production', 'Vocals', 'Lyrics', 'Replay Value', 'Creativity']
};

export default function ReviewModal({ item, category, onClose, onSave }) {
	const [reviewText, setReviewText] = useState('');
	const [ratings, setRatings] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const isLoggedIn = !!localStorage.getItem('token');
	// 1. SMART INITIALIZATION
	useEffect(() => {
		if (item.ratingBreakdown) {
			// EDIT MODE: Load existing data
			setRatings(item.ratingBreakdown);
			setReviewText(item.reviewText || '');
		} else {
			// NEW MODE: Load defaults (5/10)
			const initial = {};
			const fields = CRITERIA[category] || ['General'];
			fields.forEach(f => initial[f.toLowerCase()] = 5);
			setRatings(initial);
			setReviewText('');
		}
	}, [item, category]);

	const handleRatingChange = (key, value) => {
		setRatings(prev => ({ ...prev, [key]: Number(value) }));
	};

	const calculateAverage = () => {
		const values = Object.values(ratings);
		if (values.length === 0) return 0;
		const sum = values.reduce((a, b) => a + b, 0);
		return (sum / values.length).toFixed(1);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// 2. SMART SAVE (Update vs Add)
			if (item._id) {
				// We have a MongoDB ID, so this is an UPDATE
				await axios.put('/api/reviews', {
					id: item._id,
					reviewText,
					ratingBreakdown: ratings
				});
			} else {
				// No ID, so this is a NEW ADD
				const payload = {
					title: item.title,
					category: category,
					itemId: item.id || item.itemId,
					posterUrl: item.image || item.posterUrl,
					subtitle: item.year || item.subtitle || item.artist || 'N/A',
					reviewText,
					ratingBreakdown: ratings,
				};
				await axios.post('/api/reviews', payload);
			}

			onSave(); // Refresh list
			onClose();
		} catch (err) {
			alert('Failed to save review');
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	// 3. DELETE FUNCTIONALITY
	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this review?")) return;

		setIsDeleting(true);
		try {
			await axios.delete(`/api/reviews?id=${item._id}`);
			onSave();
			onClose();
		} catch (err) {
			alert('Failed to delete');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
			<div className="bg-secondary/90 w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

				{/* Header */}
				<div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
					<div className="flex gap-4">
						<div className="w-16 h-24 bg-black rounded shadow-lg flex-shrink-0 overflow-hidden">
							<img src={item.image || item.posterUrl} className="w-full h-full object-cover" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-white">{item.title}</h2>
							<p className="text-primary font-medium">
								{category.toUpperCase()} • {item.year || item.subtitle}
							</p>
							{/* Show "Editing" badge if in edit mode */}
							{item._id && (
								<span className="inline-block mt-2 text-xs bg-accent/20 text-accent px-2 py-1 rounded border border-accent/50">
									EDITING REVIEW
								</span>
							)}
						</div>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
						<FaTimes size={24} />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

					{/* Rating Sliders Grid */}
					<div>
						<div className="flex justify-between items-end mb-4">
							<h3 className="text-lg font-semibold text-white border-l-4 border-accent pl-3">Ratings</h3>
							<span className="text-3xl font-bold text-yellow-400">{calculateAverage()}</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
							{Object.keys(ratings).map((key) => (
								<div key={key}>
									<div className="flex justify-between text-sm mb-1 text-gray-300">
										<label className="capitalize">{key}</label>
										<span className="font-mono text-accent">{ratings[key]}</span>
									</div>
									<input disabled={!isLoggedIn}
										type="range"
										min="1"
										max="10"
										step="0.5"
										value={ratings[key]}
										onChange={(e) => handleRatingChange(key, e.target.value)}
										className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-accent hover:accent-primary transition-all"
									/>
								</div>
							))}
						</div>
					</div>

					{/* Written Review */}
					<div>
						<h3 className="text-lg font-semibold text-white border-l-4 border-accent pl-3 mb-4">My Thoughts</h3>
						<textarea disabled={!isLoggedIn}
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							placeholder="What did you think about this?"
							className="w-full h-32 bg-black/30 text-white p-4 rounded-xl border border-white/10 focus:border-accent focus:outline-none resize-none"
						/>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="p-6 border-t border-white/10 bg-black/20 flex justify-between">

					{/* Delete Button (Only shows if editing) */}
					<div>
						{item._id && isLoggedIn && (
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="px-4 py-2 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
							>
								<FaTrash size={14} /> Delete
							</button>
						)}
					</div>

					<div className="flex gap-3">
						<button onClick={onClose} className="px-6 py-2 rounded-full text-gray-300 hover:text-white font-medium hover:bg-white/5 transition-colors">
							Cancel
						</button>
						{isLoggedIn && (
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="px-8 py-2 rounded-full bg-accent hover:bg-primary text-white font-bold shadow-lg shadow-accent/20 flex items-center gap-2 transition-all transform hover:scale-105"
							>
								{isSubmitting ? 'Saving...' : <><FaSave /> Save</>}
							</button>
						)}
					</div>
				</div>

			</div>
		</div>
	);
}
