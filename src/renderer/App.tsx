import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import StartPage from './pages/StartPage/StartPage';
import ReportPage from './pages/ReportPage/ReportPage';
import Layout from './components/Layout/Layout';
import './App.scss';

export default function App() {
  return (
    <Router initialEntries={['/start']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/start" element={<StartPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </Router>
  );
}
