const axios = require('axios');
const qs = require('querystring');

// Helper for Spotify Token
async function getSpotifyToken() {
	const tokenUrl = 'https://accounts.spotify.com/api/token';
	const data = qs.stringify({ grant_type: 'client_credentials' });
	const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
	const response = await axios.post(tokenUrl, data, {
		headers: {
			'Authorization': `Basic ${authString}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
	return response.data.access_token;
}

module.exports = async (req, res) => {
	const { type, q } = req.query; // Now we read 'type' from the URL (?type=movie)

	if (!q || !type) {
		return res.status(400).json({ error: 'Missing query or type' });
	}

	try {
		let results = [];

		// --- MOVIES ---
		if (type === 'movie') {
			const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(q)}&type=movie`;
			const response = await axios.get(url);
			if (response.data.Response !== 'False') {
				results = response.data.Search.map(item => ({
					id: item.imdbID,
					title: item.Title,
					image: item.Poster !== 'N/A' ? item.Poster : null,
					year: item.Year,
					category: 'movie',
					source: 'omdb'
				}));
			}
		}

		// --- TV SHOWS ---
		else if (type === 'tv') {
			const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(q)}&type=series`;
			const response = await axios.get(url);
			if (response.data.Response !== 'False') {
				results = response.data.Search.map(item => ({
					id: item.imdbID,
					title: item.Title,
					image: item.Poster !== 'N/A' ? item.Poster : null,
					year: item.Year,
					category: 'tv',
					source: 'omdb'
				}));
			}
		}

		// --- ANIME ---
		else if (type === 'anime') {
			const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`;
			const response = await axios.get(url);
			results = response.data.data.map(item => ({
				id: item.mal_id,
				title: item.title,
				image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
				year: item.year || (item.aired?.from ? item.aired.from.substring(0, 4) : 'N/A'),
				category: 'anime',
				source: 'jikan'
			}));
		}

		// --- GAMES ---
		else if (type === 'game') {
			const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(q)}&page_size=10`;
			const response = await axios.get(url);
			results = response.data.results.map(item => ({
				id: item.id,
				title: item.name,
				image: item.background_image,
				year: item.released ? item.released.substring(0, 4) : 'N/A',
				category: 'game',
				source: 'rawg'
			}));
		}

		// --- BOOKS ---
		else if (type === 'book') {
			const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
			const response = await axios.get(url);
			results = response.data.docs.map(item => ({
				id: item.key.replace('/works/', ''),
				title: item.title,
				image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
				year: item.first_publish_year || 'N/A',
				author: item.author_name ? item.author_name.join(', ') : 'Unknown',
				category: 'book',
				source: 'openlibrary'
			}));
		}

		// --- MANGA ---
		else if (type === 'manga') {
			const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=10&includes[]=cover_art`;
			const response = await axios.get(url);
			results = response.data.data.map(item => {
				const coverRel = item.relationships.find(r => r.type === 'cover_art');
				const fileName = coverRel?.attributes?.fileName;
				return {
					id: item.id,
					title: item.attributes.title.en || Object.values(item.attributes.title)[0],
					image: fileName ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}` : null,
					year: item.attributes.year || 'N/A',
					category: 'manga',
					source: 'mangadex'
				};
			});
		}

		// --- MUSIC ---
		else if (type === 'music') {
			const accessToken = await getSpotifyToken();
			const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=10`;
			const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
			results = response.data.albums.items.map(item => ({
				id: item.id,
				title: item.name,
				image: item.images[0]?.url || null,
				year: item.release_date ? item.release_date.substring(0, 4) : 'N/A',
				artist: item.artists.map(a => a.name).join(', '),
				category: 'music',
				source: 'spotify'
			}));
		}

		res.status(200).json(results);

	} catch (error) {
		console.error(`Search Error (${type}):`, error.message);
		res.status(500).json({ error: `Failed to fetch ${type}` });
	}
};
