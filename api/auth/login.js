const jwt = require('jsonwebtoken');

// Map usernames to their specific environment variable passwords
const USERS = {
	"Aneesh": process.env.ADMIN_PASSWORD,   // You
	"Anuj": process.env.ANUJ_PASSWORD,
	"Dhanush": process.env.DHANUSH_PASSWORD,
	"Alwin": process.env.ALWIN_PASSWORD
};

module.exports = (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { username, password } = req.body;

	// 1. Check if user exists in our list
	if (!USERS.hasOwnProperty(username)) {
		return res.status(401).json({ error: 'User not found' });
	}

	// 2. Check if password matches
	if (password !== USERS[username]) {
		return res.status(401).json({ error: 'Invalid password' });
	}

	// 3. Issue Token
	// We embed the 'username' inside the token so the backend always knows who is logged in
	const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});

	res.status(200).json({ token, username });
};
