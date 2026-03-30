import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js';
import ToastProvider from './hooks/useToast.jsx';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ScrollToTop>
      </BrowserRouter>
    </Provider>
  </HelmetProvider>,
)
