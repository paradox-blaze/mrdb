// api/search/book.js
const axios = require('axios');

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		// Open Library Search API
		const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;

		const response = await axios.get(url);
		const docs = response.data.docs;

		const results = docs.map((item) => ({
			// The key usually looks like "/works/OL12345W", we just want the ID
			id: item.key.replace('/works/', ''),
			title: item.title,
			// Construct the cover URL using the cover_i ID
			image: item.cover_i
				? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
				: null,
			year: item.first_publish_year || 'N/A',
			author: item.author_name ? item.author_name.join(', ') : 'Unknown',
			category: 'book',
			source: 'openlibrary'
		}));

		res.status(200).json(results);

	} catch (error) {
		console.error('Open Library Error:', error.message);
		res.status(500).json({ error: 'Failed to fetch books' });
	}
};
