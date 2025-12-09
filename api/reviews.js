const connectToDatabase = require('./lib/mongo');
const Review = require('./models/Review');
const verifyToken = require('./lib/auth');

module.exports = async (req, res) => {
	await connectToDatabase();

	// --- GET (List Reviews) ---
	if (req.method === 'GET') {
		const { category } = req.query;
		let query = {};
		if (category && category !== 'all') {
			query.category = category;
		}
		try {
			// Sort by Highest Score, then Newest
			const reviews = await Review.find(query).sort({ overallScore: -1, createdAt: -1 });
			return res.status(200).json(reviews);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch reviews' });
		}
	}

	// --- AUTH CHECK FOR WRITE OPERATIONS ---
	// If method is POST, PUT, or DELETE, check the token
	if (!verifyToken(req)) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	// --- POST (Add Review) ---
	if (req.method === 'POST') {
		try {
			const { title, category, itemId, posterUrl, subtitle, reviewText, ratingBreakdown } = req.body;

			const scores = Object.values(ratingBreakdown);
			const total = scores.reduce((a, b) => a + Number(b), 0);
			const average = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;

			const newReview = new Review({
				title, category, itemId, posterUrl, subtitle, reviewText, ratingBreakdown,
				overallScore: average
			});

			await newReview.save();
			return res.status(201).json({ message: 'Review saved', review: newReview });
		} catch (error) {
			return res.status(500).json({ error: 'Failed to save review' });
		}
	}

	// --- PUT (Update Review) ---
	if (req.method === 'PUT') {
		try {
			const { id, reviewText, ratingBreakdown } = req.body;
			const updates = {};
			if (reviewText !== undefined) updates.reviewText = reviewText;
			if (ratingBreakdown) {
				updates.ratingBreakdown = ratingBreakdown;
				const scores = Object.values(ratingBreakdown);
				const total = scores.reduce((a, b) => a + Number(b), 0);
				const average = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;
				updates.overallScore = average;
			}
			updates.updatedAt = Date.now();

			await Review.findByIdAndUpdate(id, updates);
			return res.status(200).json({ message: 'Review updated' });
		} catch (error) {
			return res.status(500).json({ error: 'Failed to update review' });
		}
	}

	// --- DELETE (Remove Review) ---
	if (req.method === 'DELETE') {
		try {
			const { id } = req.query;
			await Review.findByIdAndDelete(id);
			return res.status(200).json({ message: 'Review deleted' });
		} catch (error) {
			return res.status(500).json({ error: 'Failed to delete review' });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
};
