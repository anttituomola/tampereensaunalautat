import prisma from 'lib/prisma'
import { Lautta } from 'types'
import dayjs from 'dayjs'
import styles from 'styles/[url_name].module.css'
import Image from 'next/image'
import Head from 'next/head'

type Props = {
  sauna: Lautta
}

const name = ({ sauna }: Props) => {
  const pricing = sauna.pricemin === sauna.pricemax ? sauna.pricemin : `${sauna.pricemin} - ${sauna.pricemax}`
  const sortedEquipment = sauna.equipment.sort((a, b) => a.localeCompare(b))
  const saunaName = sauna.name
  const saunaLocation = sauna.location
  const title = `Tampereen saunalautat: ${saunaName}, ${saunaLocation}`

  return (
    <>
      <Head key={sauna.name}>
        <title>{title}</title>
        <meta name="description" content={`${sauna.name} sijainti on ${sauna.location} ja vuokrahinta on alkaen ${sauna.pricemin}`} />
      </Head>
      <div className={styles.container}>
        <h1>Tampereen saunalautat: {sauna.name}</h1>
        <div className={styles.mainImageHolder}>
          <Image className={styles.mainImage} src={`/images/${sauna.mainImage}`} alt={sauna.name} layout="fill" priority />
        </div>
        <h3>{sauna.location}</h3>
        <small>{sauna.name} pystyy {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)" ? "saunottamaan" : "kuljettamaan risteilyllä"} maksimissaan {sauna.capacity} henkilöä.</small>
        <div className="pricing">
          <h2>Hinnoittelu</h2>
          <p>Vuonna {dayjs().format("YYYY")} tyypillinen <strong>{sauna.eventLength} tunnin {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)" ? "sauna" : "risteily"}</strong> saunalautalla {sauna.name} maksaa <strong>noin {pricing} €</strong>. {sauna.notes}</p>
        </div>
        <div className="contact">
          <h2>Yhteystiedot</h2>
          <p>Kotisivut: </p>
            {sauna.urlArray.map(url => {
              return <li key={url}><a href={url}>{url}</a></li>
            })}
          <p>Puhelinnumero: <a href={`tel:${sauna.phone}`}>{sauna.phone}</a></p>
          <p>Sähköposti: <a href={`mailto:${sauna.email}`}>{sauna.email}</a></p>
        </div>
        <div className="equipment">
          <h2>Varusteet</h2>
          <p>{sauna.equipment.map(thing => <li key={thing}>{thing}</li>)}</p>
        </div>
      </div>
    </>
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
