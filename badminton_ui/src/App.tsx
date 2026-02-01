import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import AnalysisHub from './pages/AnalysisHub';
import SessionHistory from './pages/SessionHistory';
import Stats from './pages/Stats';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<AnalysisHub />} />
          <Route path="history" element={<SessionHistory />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<div className='p-10'>Profile Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
