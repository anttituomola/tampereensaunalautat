import styles from 'styles/Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <p>
        Tämän sivuston on tehnyt rakkaudella Tamperetta ja saunoja kohtaan{' '}
        <a href='https://anttituomola.fi'>
          <span style={{ textDecoration: 'underline' }}>Antti Tuomola</span>
        </a>
        .
      </p>
      <p className={styles.links}>
        <Link href='/terms' className={styles.link}>
          Käyttöehdot
        </Link>
        {' • '}
        <a href='mailto:antti@anttituomola.fi' className={styles.link}>
          Yhteystiedot
        </a>
      </p>
    </div>
  );
};

export default Footer;
