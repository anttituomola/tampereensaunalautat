import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { prisma } from '../lib/prisma'
import { Lautta } from "../types"

interface Props {
  saunas: Lautta[]
}

const Home: NextPage<Props> = ({ saunas }) => {
  console.log(saunas)
  const renderSaunas = saunas.map(sauna => {
    return (
      <div key={sauna.id}>
        <h1>{sauna.name}</h1>
      </div>
    )
  })

  return (
    <div className={styles.container}>
      <Head>
        <title>Tampereen saunalautat</title>
      </Head>
      <div className={styles.main}>
        <h1>Tampereen saunalautat</h1>
        {renderSaunas}
      </div>
    </div>
  )
}

export default Home

export async function getStaticProps() {
  const saunas = await prisma.lautta.findMany()
  return {
    props: {
      saunas,
    },
  }
}