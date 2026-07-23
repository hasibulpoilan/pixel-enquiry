import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainPage from './pages/MainPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage adminMode={false} />} />
          <Route path="/admin" element={<MainPage adminMode={true} />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
