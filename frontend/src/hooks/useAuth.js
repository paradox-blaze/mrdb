import { useState, useEffect } from 'react';

// Custom event to signal auth changes across components
const AUTH_EVENT = 'auth-change';

export function useAuth() {
	const [user, setUser] = useState(localStorage.getItem('currentUser'));
	const [token, setToken] = useState(localStorage.getItem('token'));

	useEffect(() => {
		// Function to update local state when event fires
		const handleAuthChange = () => {
			setUser(localStorage.getItem('currentUser'));
			setToken(localStorage.getItem('token'));
		};

		// Listen for our custom event
		window.addEventListener(AUTH_EVENT, handleAuthChange);
		return () => window.removeEventListener(AUTH_EVENT, handleAuthChange);
	}, []);

	const login = (newToken, newUser) => {
		localStorage.setItem('token', newToken);
		localStorage.setItem('currentUser', newUser);
		// Trigger the event so Navbar knows immediately
		window.dispatchEvent(new Event(AUTH_EVENT));
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('currentUser');
		window.dispatchEvent(new Event(AUTH_EVENT));
	};

	return { user, token, login, logout };
}
