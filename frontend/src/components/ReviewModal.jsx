// frontend/src/components/ReviewModal.jsx
import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa'; // Added Trash Icon
import axios from 'axios';

const CRITERIA = {
	movie: ['Plot', 'Characters', 'Music', 'Cinematography', 'Pacing', 'Acting', 'Impact'],
	tv: ['Plot', 'Characters', 'Music', 'Cinematography', 'Pacing', 'Acting', 'Impact'],
	anime: ['Plot', 'Animation', 'Sound', 'Characters', 'Impact'],
	game: ['Gameplay', 'Graphics', 'Plot', 'Music', 'Impact'],
	book: ['Plot', 'Characters', 'World Building', 'Pacing', 'Impact'],
	manga: ['Plot', 'Art', 'Characters', 'Pacing', 'Impact'],
	music: ['Production', 'Vocals', 'Lyrics', 'Replay Value', 'Impact']
};

export default function ReviewModal({ item, category, onClose, onSave, readOnly }) { // Added readOnly prop
	const [reviewText, setReviewText] = useState('');
	const [ratings, setRatings] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (item.ratingBreakdown) {
			setRatings(item.ratingBreakdown);
			setReviewText(item.reviewText || '');
		} else {
			const initial = {};
			const fields = CRITERIA[category] || ['General'];
			fields.forEach(f => initial[f.toLowerCase()] = 5);
			setRatings(initial);
			setReviewText('');
		}
	}, [item, category]);

	const handleRatingChange = (key, value) => {
		if (readOnly) return; // Block changes
		setRatings(prev => ({ ...prev, [key]: Number(value) }));
	};

	const calculateAverage = () => {
		const values = Object.values(ratings);
		if (values.length === 0) return 0;
		const sum = values.reduce((a, b) => a + b, 0);
		return (sum / values.length).toFixed(1);
	};

	const handleSubmit = async () => {
		if (readOnly) return; // Security check
		setIsSubmitting(true);

		try {
			// CASE 1: UPDATING an existing review (it has an _id)
			if (item._id) {
				await axios.put('/api/reviews', {
					id: item._id,
					reviewText,
					ratingBreakdown: ratings
				});
			}
			// CASE 2: CREATING a new review
			else {
				const payload = {
					title: item.title,
					category: category,
					itemId: item.id || item.itemId, // Handles both API items and DB items
					posterUrl: item.image || item.posterUrl,
					subtitle: item.year || item.subtitle || item.artist || 'N/A',
					reviewText,
					ratingBreakdown: ratings,
				};
				await axios.post('/api/reviews', payload);
			}

			// If successful:
			onSave(); // Refresh the grid
			onClose(); // Close the modal

		} catch (err) {
			// ERROR HANDLING
			// If backend sends a specific message (like "Duplicate"), show that.
			// Otherwise, show a generic "Failed" message.
			const message = err.response?.data?.error || 'Failed to save. Please try again.';
			alert(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (readOnly) return;
		if (!confirm("Delete this review?")) return;
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
							<div className="flex items-center gap-2 mt-1">
								<span className="text-primary font-medium text-sm uppercase tracking-wide">{category}</span>
								{readOnly && <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">READ ONLY</span>}
							</div>
						</div>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
						<FaTimes size={24} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
					{/* Ratings */}
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
									<input
										type="range"
										min="1" max="10" step="0.5"
										value={ratings[key]}
										onChange={(e) => handleRatingChange(key, e.target.value)}
										disabled={readOnly} // <--- DISABLED IF READ ONLY
										className={`w-full h-2 rounded-lg appearance-none transition-all ${readOnly ? 'bg-gray-700 cursor-not-allowed' : 'bg-black/40 cursor-pointer accent-accent hover:accent-primary'}`}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Review Text */}
					<div>
						<h3 className="text-lg font-semibold text-white border-l-4 border-accent pl-3 mb-4">Thoughts</h3>
						<textarea
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							disabled={readOnly} // <--- DISABLED IF READ ONLY
							placeholder={readOnly ? "No written review." : "Write your review here..."}
							className={`w-full h-32 bg-black/30 text-white p-4 rounded-xl border border-white/10 focus:outline-none resize-none ${readOnly ? 'text-gray-400' : 'focus:border-accent'}`}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center">
					{/* Left Side: Delete (Only if NOT read only and editing existing) */}
					<div>
						{!readOnly && item._id && (
							<button onClick={handleDelete} disabled={isDeleting} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm">
								<FaTrash /> Delete
							</button>
						)}
					</div>

					{/* Right Side: Close/Save */}
					<div className="flex gap-3">
						<button onClick={onClose} className="px-6 py-2 rounded-full text-gray-300 hover:text-white font-medium hover:bg-white/5 transition-colors">
							{readOnly ? 'Close' : 'Cancel'}
						</button>
						{!readOnly && (
							<button

								disabled={isSubmitting}
								className="px-8 py-2 rounded-full bg-accent hover:bg-primary text-white font-bold shadow-lg shadow-accent/20 flex items-center gap-2 transition-transform hover:scale-105"
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
