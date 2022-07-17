import styles from "/styles/about.module.css"

const about = () => {
  return (
    <main className={styles.container}>
        <h1>Tietoa sivustosta</h1>
        <p>Ohjelmistokehittäjä <a href="https://www.anttituomola.fi" target="_blank" rel="noreferrer">Antti Tuomola</a> halusi järjestää ystävilleen illan saunalautalla, mutta huomasi, että Tampereen laajan saunalauttatarjonnan vertailu on varsin mutkikasta, sillä tietoa lautoista ei oltu koottu minnekään yhteen. Näin syntyi tampereensaunalautat.fi, ja internet - sekä Tampere - on taas piirun verran parempi paikka elää ja yrittää.</p>
        <h2>Oletko saunalauttayrittäjä?</h2>
        <p>Haluatko tietoihisi muutoksia? Eikö lauttaasi löydy tältä sivulta? Jotain muuta? Laita mailia: <a href="mailto:antti@anttituomola.fi">antti@anttituomola.fi</a></p>
    </main>
    )
}
export default about