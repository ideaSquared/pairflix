import { Card, Container, Flex, H1, Typography } from '@pairflix/components';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as styles from './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Flex direction="column" className={styles.pageShell}>
      <Card className={styles.header}>
        <Container>
          <Flex className={styles.headerContent}>
            <H1 onClick={() => navigate('/')} className={styles.brand}>
              PairFlix
            </H1>
            {isAuthenticated && (
              <nav className={styles.nav}>
                <Typography
                  className={styles.navLink({
                    active: currentPath === '/watchlist',
                  })}
                  onClick={() => navigate('/watchlist')}
                >
                  My Watchlist
                </Typography>
                <Typography
                  className={styles.navLink({
                    active: currentPath === '/matches',
                  })}
                  onClick={() => navigate('/matches')}
                >
                  Matches
                </Typography>
                {isAdmin && (
                  <Typography
                    className={styles.navLink({
                      active: currentPath === '/admin/',
                    })}
                    onClick={() => navigate('/admin/')}
                  >
                    Admin
                  </Typography>
                )}
                <Typography
                  className={styles.navLink({
                    active: currentPath === '/profile',
                  })}
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </Typography>
                <Typography
                  className={styles.navLink({ active: false })}
                  onClick={handleLogout}
                >
                  Logout
                </Typography>
              </nav>
            )}
          </Flex>
        </Container>
      </Card>
      <main className={styles.main}>
        <Container>{children}</Container>
      </main>
    </Flex>
  );
};

export default Layout;
