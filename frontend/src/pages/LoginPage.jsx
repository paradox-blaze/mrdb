import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const res = await axios.post('/api/auth/login', { username, password });

			// Save Token AND Username
			localStorage.setItem('token', res.data.token);
			localStorage.setItem('currentUser', res.data.username); // Save who I am

			axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
			navigate('/');
		} catch (err) {
			setError('Invalid username or password');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background text-text">
			<form onSubmit={handleLogin} className="bg-secondary/20 p-8 rounded-2xl border border-white/10 w-96 shadow-2xl backdrop-blur-md">
				<h1 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h1>
				<p className="text-gray-400 text-center mb-8 text-sm">Login to your collection</p>

				{error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 text-center">{error}</div>}

				<div className="space-y-4">
					<div>
						<label className="block text-xs uppercase text-gray-500 font-bold mb-2">Username</label>
						<input
							type="text"
							placeholder="e.g. Alice"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent outline-none text-white transition-colors"
						/>
					</div>

					<div>
						<label className="block text-xs uppercase text-gray-500 font-bold mb-2">Password</label>
						<input
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent outline-none text-white transition-colors"
						/>
					</div>
				</div>

				<button className="w-full mt-8 bg-accent hover:bg-primary text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-accent/20">
					Login
				</button>
			</form>
		</div>
	);
}
