const connectToDatabase = require('./lib/mongo');
const Review = require('./models/Review');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
	await connectToDatabase();

	// --- GET (Public / Friend View) ---
	if (req.method === 'GET') {
		const { category, username } = req.query;

		let query = {};
		if (category && category !== 'all') query.category = category;

		// IMPORTANT: If a username is requested (?username=Alice), filter by it.
		// If NO username is requested, we default to "Me" (the Admin) to keep the homepage clean.
		if (username) {
			query.username = username;
		} else {
			query.username = "Aneesh"; // Default homepage shows YOUR reviews
		}

		const reviews = await Review.find(query).sort({ overallScore: -1, createdAt: -1 });
		return res.status(200).json(reviews);
	}

	// --- AUTH VERIFICATION ---
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

	let currentUser;
	try {
		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		currentUser = decoded.username; // Get "Me", "Alice", etc. from token
	} catch (error) {
		return res.status(401).json({ error: 'Invalid token' });
	}

	// --- POST (Add Review) ---
	if (req.method === 'POST') {
		try {
			const { title, category, itemId, posterUrl, subtitle, reviewText, ratingBreakdown } = req.body;

			// 1. CHECK FOR DUPLICATE 🛑
			const existingReview = await Review.findOne({
				itemId: itemId,
				username: currentUser
			});

			if (existingReview) {
				return res.status(409).json({ error: `You have already reviewed "${title}"` });
			}

			// 2. Calculate Score
			const scores = Object.values(ratingBreakdown);
			const total = scores.reduce((a, b) => a + Number(b), 0);
			const average = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;

			// 3. Save New Review
			const newReview = new Review({
				title, category, itemId, posterUrl, subtitle, reviewText, ratingBreakdown,
				overallScore: average,
				username: currentUser
			});

			await newReview.save();
			return res.status(201).json({ message: 'Review saved', review: newReview });

		} catch (error) {
			return res.status(500).json({ error: 'Failed to save review' });
		}
	}

	// --- PUT (Update Review) ---
	if (req.method === 'PUT') {
		const { id, reviewText, ratingBreakdown } = req.body;

		// Check ownership
		const review = await Review.findById(id);
		if (!review) return res.status(404).json({ error: 'Review not found' });

		if (review.username !== currentUser) {
			return res.status(403).json({ error: "You can only edit your own reviews" });
		}

		// Recalculate score
		let updates = { reviewText, ratingBreakdown, updatedAt: Date.now() };
		if (ratingBreakdown) {
			const scores = Object.values(ratingBreakdown);
			const total = scores.reduce((a, b) => a + Number(b), 0);
			updates.overallScore = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;
		}

		await Review.findByIdAndUpdate(id, updates);
		return res.status(200).json({ message: 'Updated' });
	}

	// --- DELETE (Remove Review) ---
	if (req.method === 'DELETE') {
		const { id } = req.query;
		const review = await Review.findById(id);
		if (!review) return res.status(404).json({ error: 'Not found' });

		if (review.username !== currentUser) {
			return res.status(403).json({ error: "You can only delete your own reviews" });
		}

		await Review.findByIdAndDelete(id);
		return res.status(200).json({ message: 'Deleted' });
	}

	return res.status(405).json({ error: 'Method not allowed' });
};
