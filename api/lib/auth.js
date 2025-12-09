// api/lib/auth.js
const jwt = require('jsonwebtoken');

function verifyToken(req) {
	// Get token from header: "Authorization: Bearer <token>"
	const authHeader = req.headers.authorization;

	if (!authHeader) return false;

	const token = authHeader.split(' ')[1]; // Remove "Bearer " word
	if (!token) return false;

	try {
		jwt.verify(token, process.env.JWT_SECRET);
		return true; // Token is valid
	} catch (error) {
		return false; // Token expired or fake
	}
}

module.exports = verifyToken;
