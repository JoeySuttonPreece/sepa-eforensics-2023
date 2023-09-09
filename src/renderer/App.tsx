import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StartPage from './StartPage';
import ReportComponent from './Report';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/report" element={<ReportComponent />} />
      </Routes>
    </Router>
  );
}
