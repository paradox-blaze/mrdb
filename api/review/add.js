// api/review/add.js
const connectToDatabase = require('../lib/mongo');
const Review = require('../models/Review');
const verifyToken = require('../lib/auth');

module.exports = async (req, res) => {
	// Only allow POST requests
	if (!verifyToken(req)) {
		return res.status(401).json({ error: 'Unauthorized: Please login' });
	}
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		await connectToDatabase();

		const {
			title,
			category,
			itemId,
			posterUrl,
			subtitle,
			reviewText,
			ratingBreakdown
		} = req.body;

		// 1. Validation
		if (!title || !category || !itemId || !ratingBreakdown) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// 2. Auto-Calculate Overall Score (Backend Verification)
		// We sum up the values in ratingBreakdown and divide by the number of keys
		const scores = Object.values(ratingBreakdown);
		const total = scores.reduce((acc, curr) => acc + Number(curr), 0);
		const average = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;

		// 3. Create the Review
		const newReview = new Review({
			title,
			category,
			itemId,
			posterUrl,
			subtitle,
			reviewText,
			ratingBreakdown,
			overallScore: average
		});

		await newReview.save();

		res.status(201).json({ message: 'Review saved successfully!', review: newReview });

	} catch (error) {
		console.error('Add Review Error:', error);
		res.status(500).json({ error: 'Failed to add review' });
	}
};
