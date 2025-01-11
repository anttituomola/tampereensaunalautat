import Footer from './Footer'
import Head from 'next/head'
import Header from './Header'
import { AnalyticsWrapper } from "../analytics"

const Layout = ({ children }: any) => {
    return (
        <div className="layout">
            <Head>
                <title>Tampereen saunalautat: saunalautta Tampere, Näsijärvi, Pyhäjärvi</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="title" content="Tampereen saunalautat: saunalautta Tampere, Näsijärvi, Pyhäjärvi" />
                <meta name="description" content="Katso ja vertaile kaikkia Tampereen saunalauttoja ja löydä porukallesi sopivin! Sivusto listaa jokaisen saunalautan Tampereen Näsijärvellä ja Pyhäjärvellä!" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.tampereensaunalautat.fi/" />
                <meta property="og:title" content="Tampereen saunalautat" />
                <meta property="og:description" content="Katso ja vertaile kaikkia Tampereen saunalauttoja ja löydä porukallesi sopivin! Sivusto listaa jokaisen saunalautan Tampereen Näsijärvellä ja Pyhäjärvellä!" />
                <meta property="og:image" content="/images/laineilla_1.jpg" />
            </Head>
            <Header />
            <main>
                {children}
                <AnalyticsWrapper />
            </main>
            <Footer />
        </div>
    )
}
export default Layout