// api/review/list.js
const connectToDatabase = require('../lib/mongo');
const Review = require('../models/Review');

module.exports = async (req, res) => {
	try {
		await connectToDatabase();

		const { category } = req.query;
		let query = {};

		// If a category is provided (e.g., ?category=movie), filter by it.
		// If not, return everything.
		if (category && category !== 'all') {
			query.category = category;
		}

		// Fetch reviews and sort by Overall Score (Highest first)
		const reviews = await Review.find(query).sort({ overallScore: -1, createdAt: -1 });

		res.status(200).json(reviews);

	} catch (error) {
		console.error('List Reviews Error:', error);
		res.status(500).json({ error: 'Failed to fetch reviews' });
	}
};
