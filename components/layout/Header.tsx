import Link from 'next/link'
import styles from 'styles/Header.module.css'

type Props = {}
const Header = (props: Props) => {
    return (
        <nav className={styles.navigation}>
            <ul>
                <li>
                    <Link href="/">
                        <a>Kaikki saunalautat</a>
                    </Link>
                </li>
                <li>
                    <Link href="/about">
                        <a>Tietoa sivustosta</a>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}
export default Header