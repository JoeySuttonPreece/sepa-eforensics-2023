import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import StartPage from './pages/StartPage/StartPage';
import ReportPage from './pages/ReportPage/ReportPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}
