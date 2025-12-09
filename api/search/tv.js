// api/search/tv.js
const axios = require('axios');

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		const apiKey = process.env.OMDB_API_KEY;
		// Changed type to 'series'
		const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q)}&type=series`;

		const response = await axios.get(url);
		const data = response.data;

		if (data.Response === 'False') {
			return res.status(200).json([]);
		}

		const results = data.Search.map((item) => ({
			id: item.imdbID,
			title: item.Title,
			image: item.Poster !== 'N/A' ? item.Poster : null,
			year: item.Year,
			category: 'tv',     // Changed category
			source: 'omdb'
		}));

		res.status(200).json(results);

	} catch (error) {
		console.error('OMDB TV Error:', error);
		res.status(500).json({ error: 'Failed to fetch TV shows' });
	}
};
