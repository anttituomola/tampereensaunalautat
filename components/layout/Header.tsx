import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Link from 'next/link';
import styles from 'styles/Header.module.css';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

const Header = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AppBar position='static' className={styles.appBar}>
      <Container className={styles.container}>
        <Toolbar className={styles.toolbar}>
          <div className={styles.logo}>
            <Link href='/'>Tampereen Saunalautat</Link>
          </div>
          <nav className={styles.navigation}>
            <Link href='/' className={isActive('/') ? styles.active : ''}>
              <Button
                className={`${styles.navButton} ${
                  isActive('/') ? styles.contained : styles.text
                }`}
              >
                {isMobile ? 'Saunat' : 'Kaikki saunalautat'}
              </Button>
            </Link>
            <Link
              href='/about'
              className={isActive('/about') ? styles.active : ''}
            >
              <Button
                className={`${styles.navButton} ${
                  isActive('/about') ? styles.contained : styles.text
                }`}
              >
                {isMobile ? 'Tietoa' : 'Tietoa sivustosta'}
              </Button>
            </Link>
            <Link
              href='/register-sauna'
              className={isActive('/register-sauna') ? styles.active : ''}
            >
              <Button
                className={`${styles.navButton} ${
                  isActive('/register-sauna') ? styles.contained : styles.text
                }`}
                variant='outlined'
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {isMobile ? 'Rekisteröi' : 'Rekisteröi saunalautta'}
              </Button>
            </Link>

            {/* Authentication-aware navigation */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Link
                    href='/dashboard'
                    className={isActive('/dashboard') ? styles.active : ''}
                  >
                    <Button
                      className={`${styles.navButton} ${
                        isActive('/dashboard') ? styles.contained : styles.text
                      }`}
                      startIcon={<DashboardIcon />}
                      variant='contained'
                      sx={{
                        backgroundColor: '#2c5282',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#2a4f7a',
                        },
                      }}
                    >
                      {user?.name ? `${user.name.split(' ')[0]}` : 'Hallinta'}
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href='/login'
                    className={isActive('/login') ? styles.active : ''}
                  >
                    <Button
                      className={`${styles.navButton} ${
                        isActive('/login') ? styles.contained : styles.text
                      }`}
                      startIcon={<LoginIcon />}
                      variant='outlined'
                      sx={{
                        borderColor: '#2c5282',
                        color: '#2c5282',
                        '&:hover': {
                          borderColor: '#2a4f7a',
                          backgroundColor: 'rgba(44, 82, 130, 0.1)',
                        },
                      }}
                    >
                      {isMobile ? 'Kirjaudu' : 'Kirjaudu saunaomistajana'}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
