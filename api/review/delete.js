// api/review/delete.js
const connectToDatabase = require('../lib/mongo');
const Review = require('../models/Review');
const verifyToken = require('../lib/auth');

module.exports = async (req, res) => {
	if (!verifyToken(req)) {
		return res.status(401).json({ error: 'Unauthorized: Please login' });
	}
	if (req.method !== 'DELETE') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		await connectToDatabase();

		const { id } = req.query; // We usually pass ID in URL for DELETE (e.g. ?id=123)

		if (!id) {
			return res.status(400).json({ error: 'Review ID is required' });
		}

		const deletedReview = await Review.findByIdAndDelete(id);

		if (!deletedReview) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.status(200).json({ message: 'Review deleted successfully' });

	} catch (error) {
		console.error('Delete Review Error:', error);
		res.status(500).json({ error: 'Failed to delete review' });
	}
};
