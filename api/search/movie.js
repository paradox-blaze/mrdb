// api/search/movie.js
const axios = require('axios');

module.exports = async (req, res) => {
	// 1. Get the search query from the URL (e.g., /api/search/movie?q=Batman)
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		// 2. Call OMDB API
		// We restrict type to 'movie' to keep results clean
		const apiKey = process.env.OMDB_API_KEY;
		const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q)}&type=movie`;

		const response = await axios.get(url);
		const data = response.data;

		// OMDB returns { Response: "False", Error: "..." } if nothing is found
		if (data.Response === 'False') {
			return res.status(200).json([]); // Return empty array, not error
		}

		// 3. Normalize the data
		// We transform the raw API result into a standard "Card" format
		const results = data.Search.map((item) => ({
			id: item.imdbID,              // Unique ID
			title: item.Title,            // Title
			image: item.Poster !== 'N/A' ? item.Poster : null, // Poster URL
			year: item.Year,              // Release Year
			category: 'movie',            // Hardcoded category
			source: 'omdb'                // Debugging help
		}));

		// 4. Send back the clean list
		res.status(200).json(results);

	} catch (error) {
		console.error('OMDB Error:', error);
		res.status(500).json({ error: 'Failed to fetch movies' });
	}
};
