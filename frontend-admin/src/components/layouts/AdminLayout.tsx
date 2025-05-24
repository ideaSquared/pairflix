import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2>PairFlix Admin</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            {user?.name} ({user?.role})
          </p>
        </div>
        <nav style={{ padding: '1rem 0' }}>
          <ul style={{ listStyle: 'none' }}>
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  isActive ? 'active nav-link' : 'nav-link'
                }
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  borderLeft: '4px solid transparent'
                }}
                end
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  isActive ? 'active nav-link' : 'nav-link'
                }
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  borderLeft: '4px solid transparent'
                }}
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/activity" 
                className={({ isActive }) => 
                  isActive ? 'active nav-link' : 'nav-link'
                }
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  borderLeft: '4px solid transparent'
                }}
              >
                Activity Logs
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  isActive ? 'active nav-link' : 'nav-link'
                }
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  borderLeft: '4px solid transparent'
                }}
              >
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <div style={{ padding: '1rem 1.5rem', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              color: 'white', 
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center', 
              width: '100%',
              padding: '0.75rem 0' 
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-content">
        <header className="admin-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Admin Panel</h1>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};