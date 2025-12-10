// api/models/Cache.js
const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
	key: { type: String, required: true, unique: true, index: true }, // e.g. "movie:batman"
	data: { type: Array, required: true },
	createdAt: { type: Date, default: Date.now, expires: 604800 } // Auto-delete after 7 days
});

module.exports = mongoose.models.Cache || mongoose.model('Cache', CacheSchema);
