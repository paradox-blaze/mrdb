// api/search/manga.js
const axios = require('axios');

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		// 1. Search Manga AND ask to include cover_art data
		const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=10&includes[]=cover_art`;

		const response = await axios.get(url);
		const data = response.data.data;

		const results = data.map((item) => {
			// 2. Find the "cover_art" relationship to get the filename
			const coverRel = item.relationships.find(r => r.type === 'cover_art');
			const fileName = coverRel?.attributes?.fileName;

			// 3. Construct the image URL
			const coverUrl = fileName
				? `https://uploads.mangadex.org/covers/${item.id}/${fileName}`
				: null;

			return {
				id: item.id,
				title: item.attributes.title.en || Object.values(item.attributes.title)[0], // Handle multi-lang titles
				image: coverUrl,
				year: item.attributes.year || 'N/A',
				category: 'manga',
				source: 'mangadex'
			};
		});

		res.status(200).json(results);

	} catch (error) {
		console.error('MangaDex Error:', error.message);
		res.status(500).json({ error: 'Failed to fetch manga' });
	}
};
