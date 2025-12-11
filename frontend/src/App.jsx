import { useEffect } from 'react'; // <--- 1. Import useEffect
import axios from 'axios';         // <--- 2. Import axios
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import CategoryPage from './pages/CategoryPage';
import RequireAuth from './components/RequireAuth';

function App() {

	// <--- 3. ADD THIS WHOLE BLOCK ---
	// This restores the "Session" if you refresh the page
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		}
	}, []);
	// --------------------------------

	return (
		<Router>
			<Routes>
				<Route path="/login" element={<LoginPage />} />

				{/* PROTECTED AREA */}
				<Route element={
					<RequireAuth>
						<Layout />
					</RequireAuth>
				}>
					<Route index element={<Navigate to="/movies" replace />} />

					<Route path="movies" element={<CategoryPage type="movie" />} />
					<Route path="tv" element={<CategoryPage type="tv" />} />
					<Route path="anime" element={<CategoryPage type="anime" />} />
					<Route path="manga" element={<CategoryPage type="manga" />} />
					<Route path="games" element={<CategoryPage type="game" />} />
					<Route path="books" element={<CategoryPage type="book" />} />
					<Route path="music" element={<CategoryPage type="music" />} />

					{/* Friend Routes */}
					<Route path="u/:username/movies" element={<CategoryPage type="movie" />} />
					<Route path="u/:username/tv" element={<CategoryPage type="tv" />} />
					<Route path="u/:username/anime" element={<CategoryPage type="anime" />} />
					<Route path="u/:username/manga" element={<CategoryPage type="manga" />} />
					<Route path="u/:username/games" element={<CategoryPage type="game" />} />
					<Route path="u/:username/books" element={<CategoryPage type="book" />} />
					<Route path="u/:username/music" element={<CategoryPage type="music" />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
