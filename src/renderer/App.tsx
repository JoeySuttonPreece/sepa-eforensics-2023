import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AEASComponent from './AEAS';
import ReportComponent from './Report';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AEASComponent />} />
        <Route path="/report" element={<ReportComponent />} />
      </Routes>
    </Router>
  );
}
