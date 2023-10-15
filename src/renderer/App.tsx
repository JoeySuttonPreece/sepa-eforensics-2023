import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import StartPage from './pages/StartPage/StartPage';
import ReportPage from './pages/ReportPage/ReportPage';
import styles from './App.scss';

export default function App() {
  const [status, setStatus] = useState(
    'This is the status bar. Status and tooltips will be displayed here'
  );

  return (
    <main className={styles.app}>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage setStatus={setStatus} />} />
          <Route
            path="/report"
            element={<ReportPage setStatus={setStatus} />}
          />
        </Routes>
      </Router>
      <div className={styles.statusBar}>{status}</div>
    </main>
  );
}
