// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout';
import CategoryPage from './pages/CategoryPage';
import { useEffect } from 'react';
import axios from 'axios';


function App() {
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		}
	}, []);
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/" element={<Layout />}>
					{/* Default redirect to Movies */}
					<Route index element={<Navigate to="/movies" replace />} />

					<Route path="movies" element={<CategoryPage type="movie" />} />
					<Route path="tv" element={<CategoryPage type="tv" />} />
					<Route path="anime" element={<CategoryPage type="anime" />} />
					<Route path="manga" element={<CategoryPage type="manga" />} />
					<Route path="games" element={<CategoryPage type="game" />} />
					<Route path="books" element={<CategoryPage type="book" />} />
					<Route path="music" element={<CategoryPage type="music" />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
