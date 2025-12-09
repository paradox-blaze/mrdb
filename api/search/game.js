// api/search/game.js
const axios = require('axios');

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		const apiKey = process.env.RAWG_API_KEY;
		const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(q)}&page_size=10`;

		const response = await axios.get(url);
		const results = response.data.results.map((item) => ({
			id: item.id,
			title: item.name,
			image: item.background_image, // RAWG provides nice high-res images
			year: item.released ? item.released.substring(0, 4) : 'N/A',
			category: 'game',
			source: 'rawg'
		}));

		res.status(200).json(results);

	} catch (error) {
		console.error('RAWG Error:', error.message);
		res.status(500).json({ error: 'Failed to fetch games' });
	}
};
