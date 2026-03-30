import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop({ children }) {
    const location = useLocation();

    useEffect(() => {
        // snap to top on every navigation
        try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch (e) {
            // fallback
            window.scrollTo(0, 0);
            void e;
        }
    }, [location.pathname]);

    return children;
}
