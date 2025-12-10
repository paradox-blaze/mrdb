import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth({ children }) {
	const { user } = useAuth(); // Checks if a user is currently logged in
	const location = useLocation();

	if (!user) {
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience.
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
}
