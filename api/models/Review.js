// api/models/Review.js
const mongoose = require('mongoose');

// Define the schema
const ReviewSchema = new mongoose.Schema({
	// Core Info
	title: { type: String, required: true },
	category: { type: String, required: true, index: true }, // movie, game, music, etc.

	// External ID (e.g., IMDB ID, Spotify ID) to prevent duplicates if you want
	itemId: { type: String, required: true },

	// Visuals
	posterUrl: { type: String }, // We store the URL, not the image binary

	// Metadata (Stored as a string or flexible object)
	subtitle: { type: String }, // Artist for music, Author for books, Year for movies

	// The Review
	reviewText: { type: String },

	// Flexible Ratings Object
	// Example: { plot: 9, acting: 10 } or { gameplay: 8, music: 10 }
	ratingBreakdown: { type: Map, of: Number },

	// Calculated Score (0-10 or 0-100)
	overallScore: { type: Number, required: true, index: true },

	// Timestamps
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

// Prevent model recompilation error in serverless environment
module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
