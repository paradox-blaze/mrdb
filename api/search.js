const axios = require('axios');
const qs = require('querystring');
const connectToDatabase = require('./lib/mongo');
const Cache = require('./models/Cache');

// Helper for Spotify Token
async function getSpotifyToken() {
	const tokenUrl = 'https://accounts.spotify.com/api/token'; // Updated to correct Spotify Auth URL
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
	const { type, q } = req.query;

	if (!q || !type) {
		return res.status(400).json({ error: 'Missing query or type' });
	}

	try {
		await connectToDatabase();

		// 1. CACHE CHECK ⚡
		const cacheKey = `${type}:${q.toLowerCase().trim()}`;
		const cachedResult = await Cache.findOne({ key: cacheKey });

		if (cachedResult) {
			console.log(`⚡ Serving ${cacheKey} from Cache`);
			return res.status(200).json(cachedResult.data);
		}

		// 2. IF NOT CACHED, CALL EXTERNAL API 🌎
		console.log(`🌍 Fetching ${cacheKey} from External API`);
		let results = [];

		// --- MOVIES & TV (OMDB) ---
		if (type === 'movie' || type === 'tv') {
			const omdbType = type === 'movie' ? 'movie' : 'series';
			const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(q)}&type=${omdbType}`;
			const response = await axios.get(url);

			if (response.data.Response !== 'False') {
				results = response.data.Search.map(item => ({
					id: item.imdbID,
					title: item.Title,
					image: item.Poster !== 'N/A' ? item.Poster : null,
					year: item.Year,
					category: type,
					source: 'omdb'
				}));
			}
		}

		// --- ANIME (Jikan) ---
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

		// --- MANGA (UPDATED: Jikan / MyAnimeList) ---
		// Switched to Jikan because MangaDex covers are often missing in search results
		else if (type === 'manga') {
			const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(q)}&limit=10`;
			const response = await axios.get(url);
			results = response.data.data.map(item => ({
				id: item.mal_id,
				title: item.title,
				image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url, // Guaranteed Image
				year: item.published?.from ? item.published.from.substring(0, 4) : 'N/A',
				category: 'manga',
				source: 'jikan'
			}));
		}

		// --- GAMES (RAWG) ---
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

		// --- BOOKS (OpenLibrary) ---
		else if (type === 'book') {
			const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
			const response = await axios.get(url);
			results = response.data.docs.slice(0, 10).map(item => ({
				id: item.key.replace('/works/', ''),
				title: item.title,
				image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
				year: item.first_publish_year || 'N/A',
				author: item.author_name ? item.author_name.join(', ') : 'Unknown',
				category: 'book',
				source: 'openlibrary'
			}));
		}

		// --- MUSIC (Spotify) ---
		else if (type === 'music') {
			const accessToken = await getSpotifyToken();
			const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=10`; // Fixed Spotify Search URL
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

		// 3. SAVE RESULTS TO CACHE
		if (results.length > 0) {
			Cache.create({ key: cacheKey, data: results })
				.catch(err => console.error("Cache write error:", err.message));
		}

		res.status(200).json(results);

	} catch (error) {
		console.error(`Search Error (${type}):`, error.message);
		// Return empty array on error so frontend doesn't crash
		res.status(200).json([]);
	}
};
