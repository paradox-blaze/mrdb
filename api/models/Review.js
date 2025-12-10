const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	// Core Info
	title: { type: String, required: true },
	category: { type: String, required: true, index: true },
	itemId: { type: String, required: true },
	posterUrl: { type: String },
	subtitle: { type: String },
	reviewText: { type: String },
	ratingBreakdown: { type: Map, of: Number },
	overallScore: { type: Number, required: true, index: true },

	// NEW: The Owner of the review
	username: { type: String, required: true, index: true },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
