import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Hello from './Hello';
import Report from './Report';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}
