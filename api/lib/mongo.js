// api/lib/mongo.js
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
			return mongoose;
		});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

module.exports = connectToDatabase;
