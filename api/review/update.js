// api/review/update.js
const connectToDatabase = require('../lib/mongo');
const Review = require('../models/Review');
const verifyToken = require('../lib/auth');

module.exports = async (req, res) => {
	if (!verifyToken(req)) {
		return res.status(401).json({ error: 'Unauthorized: Please login' });
	}
	if (req.method !== 'PUT') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		await connectToDatabase();

		const { id, reviewText, ratingBreakdown } = req.body;

		if (!id) {
			return res.status(400).json({ error: 'Review ID is required' });
		}

		// Prepare the update object
		const updates = {};
		if (reviewText !== undefined) updates.reviewText = reviewText;

		// If ratings are being updated, we must recalculate the overall score
		if (ratingBreakdown) {
			updates.ratingBreakdown = ratingBreakdown;

			const scores = Object.values(ratingBreakdown);
			const total = scores.reduce((acc, curr) => acc + Number(curr), 0);
			const average = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;

			updates.overallScore = average;
		}

		updates.updatedAt = Date.now();

		const updatedReview = await Review.findByIdAndUpdate(id, updates, { new: true });

		if (!updatedReview) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.status(200).json({ message: 'Review updated', review: updatedReview });

	} catch (error) {
		console.error('Update Review Error:', error);
		res.status(500).json({ error: 'Failed to update review' });
	}
};
