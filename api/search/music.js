// api/search/music.js
const axios = require('axios');
const qs = require('querystring');

// Helper function to get Access Token
async function getSpotifyToken() {
	const tokenUrl = 'https://accounts.spotify.com/api/token';
	const data = qs.stringify({ grant_type: 'client_credentials' });

	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	// Create the Basic Auth string (base64 encoded id:secret)
	const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

	const response = await axios.post(tokenUrl, data, {
		headers: {
			'Authorization': `Basic ${authString}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	return response.data.access_token;
}

module.exports = async (req, res) => {
	const { q } = req.query;

	if (!q) {
		return res.status(400).json({ error: 'Search query is required' });
	}

	try {
		// 1. Get a fresh token
		const accessToken = await getSpotifyToken();

		// 2. Search for Albums (you can change type to 'album,track' if you want songs too)
		const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=10`;

		const response = await axios.get(searchUrl, {
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		const items = response.data.albums.items;

		const results = items.map((item) => ({
			id: item.id,
			title: item.name,
			// Spotify images are an array [large, medium, small]. We take the first (large).
			image: item.images[0]?.url || null,
			year: item.release_date ? item.release_date.substring(0, 4) : 'N/A',
			artist: item.artists.map(a => a.name).join(', '), // Extra field for music
			category: 'music',
			source: 'spotify'
		}));

		res.status(200).json(results);

	} catch (error) {
		console.error('Spotify Error:', error.response ? error.response.data : error.message);
		res.status(500).json({ error: 'Failed to fetch music' });
	}
};
