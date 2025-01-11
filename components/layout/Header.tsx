import { AppBar, Toolbar, Container, Button } from '@mui/material';
import Link from 'next/link';
import styles from 'styles/Header.module.css';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;

  return (
    <AppBar position="static" color="transparent" elevation={0} className={styles.appBar}>
      <Container maxWidth="lg">
        <Toolbar disableGutters className={styles.toolbar}>
          <div className={styles.logo}>
            <Link href="/">
              Tampereen Saunalautat
            </Link>
          </div>
          <nav className={styles.navigation}>
            <Link href="/" className={isActive('/') ? styles.active : ''}>
              <Button
                color="primary"
                className={styles.navButton}
                variant={isActive('/') ? 'contained' : 'text'}
              >
                Kaikki saunalautat
              </Button>
            </Link>
            <Link href="/about" className={isActive('/about') ? styles.active : ''}>
              <Button
                color="primary"
                className={styles.navButton}
                variant={isActive('/about') ? 'contained' : 'text'}
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