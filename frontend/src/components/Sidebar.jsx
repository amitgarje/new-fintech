import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  UploadCloud, 
  ActivitySquare, 
  BarChart3, 
  FileSearch,
} from 'lucide-react';
import './Sidebar.css';
import logo from '../assets/cipherflux_logo.png';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Home', icon: HomeIcon },
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', name: 'Upload Data', icon: UploadCloud },
    { path: '/live', name: 'Live Detection', icon: ActivitySquare },
    { path: '/analytics', name: 'Analytics', icon: BarChart3 },
    { path: '/explain', name: 'Explainability', icon: FileSearch },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="brand">
        <img src={logo} alt="CipherFlux Logo" className="brand-logo" />
        <h1 className="brand-name">Cipher<span className="text-neon-blue">Flux</span></h1>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-text">{item.name}</span>
              {isActive && <div className="active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
