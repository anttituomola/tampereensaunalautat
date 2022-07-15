import prisma from 'lib/prisma'
import { Lautta } from 'types'
import dayjs from 'dayjs'
import styles from 'styles/[url_name].module.css'

type Props = {
  sauna: Lautta
}

const name = ({ sauna }: Props) => {
  const pricing = sauna.pricemin === sauna.pricemax ? sauna.pricemin : `${sauna.pricemin} - ${sauna.pricemax}`
  return (
    <div className={styles.container}>
      <img src={sauna.mainImage} alt={`Image of saunalautta ${sauna.name}`} />
      <h1>{sauna.name}</h1>
      <h3>{sauna.location}</h3>
      <div className="pricing">
        <h2>Hinnoittelu</h2>
        <p>Vuonna {dayjs().format("YYYY")} tyypillinen kolmen tunnin risteily saunalautalla {sauna.name} maksaa <strong>noin {pricing} €</strong>. {sauna.notes}</p>
      </div>
      <div className="contact">
        <h2>Yhteystiedot</h2>
        <p>Kotisivut: <a href={sauna.url} target="_blank" rel="noreferrer">{sauna.url}</a></p>
        <p>Puhelinnumero: <a href={`tel:${sauna.phone}`}>{sauna.phone}</a></p>
        <p>Sähköposti: <a href={`mailto:${sauna.email}`}>{sauna.email}</a></p>
      </div>
      <div className="equipment">
        <h2>Varusteet</h2>
        <p>{sauna.equipment.map(thing => <li key={thing}>{thing}</li>)}</p>
      </div>
    </div>
  )
}

export default name

export const getStaticPaths = async () => {
  const saunas = await prisma.lautta.findMany()

  const paths = saunas.map(sauna => ({
    params: {
      url_name: sauna.url_name,
    },

  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = async (context: any) => {
  const sauna = await prisma.lautta.findUnique({
    where: {
      url_name: context.params.url_name,
    },
  })

  return {
    props: {
      sauna,
    },
  }
}