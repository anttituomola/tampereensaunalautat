import styles from 'styles/Footer.module.css'

const Footer = () => {
    return (
        <div className={styles.footer}>
            <p>Tämän sivuston on tehnyt rakkaudella Tamperetta ja saunoja kohtaan <a href="https://anttituomola.fi"><span style={{ textDecoration: "underline" }}>Antti Tuomola</span>.</a></p>
        </div >
    )
}
export default Footer