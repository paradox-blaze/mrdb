import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post('/api/auth/login', { password });

			// Save token to LocalStorage
			localStorage.setItem('token', res.data.token);

			// Set default header for all future axios requests
			axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

			navigate('/'); // Go home
		} catch (err) {
			setError('Wrong password');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background text-text">
			<form onSubmit={handleLogin} className="bg-secondary/20 p-8 rounded-2xl border border-white/10 w-96 shadow-2xl">
				<h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

				{error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}

				<input
					type="password"
					placeholder="Enter Master Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full bg-black/30 border border-white/10 rounded-lg p-3 mb-4 focus:border-accent outline-none text-white"
				/>

				<button className="w-full bg-accent hover:bg-primary text-white font-bold py-3 rounded-lg transition-colors">
					Unlock
				</button>
			</form>
		</div>
	);
}
