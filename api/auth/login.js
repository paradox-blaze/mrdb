// api/auth/login.js
const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
	// 1. Check Method
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { password } = req.body;

	// 2. Verify Password
	if (password !== process.env.ADMIN_PASSWORD) {
		return res.status(401).json({ error: 'Invalid password' });
	}

	// 3. Issue Token (Valid for 7 days)
	const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	});

	// 4. Send back to frontend
	res.status(200).json({ token });
};
