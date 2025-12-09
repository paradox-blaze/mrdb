// api/search/anime.js
const axios = require('axios');

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		// Jikan V4 API - No Key Needed
		const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`;

		const response = await axios.get(url);
		const data = response.data.data; // Jikan nests results inside 'data'

		const results = data.map((item) => ({
			id: item.mal_id,
			title: item.title,
			// Jikan provides multiple image sizes, we grab the large JPG
			image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
			year: item.year || (item.aired?.from ? item.aired.from.substring(0, 4) : 'N/A'),
			category: 'anime',
			source: 'jikan'
		}));

		res.status(200).json(results);

	} catch (error) {
		console.error('Jikan Error:', error.message);
		res.status(500).json({ error: 'Failed to fetch anime' });
	}
};
