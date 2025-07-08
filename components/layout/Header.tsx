import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Link from 'next/link';
import styles from 'styles/Header.module.css';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;

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
                Kaikki saunalautat
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
                Tietoa sivustosta
              </Button>
            </Link>
          </nav>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
