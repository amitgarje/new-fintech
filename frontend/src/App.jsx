import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import LiveDetection from './pages/LiveDetection';
import Analytics from './pages/Analytics';
import Explainability from './pages/Explainability';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/live" element={<LiveDetection />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/explain" element={<Explainability />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
