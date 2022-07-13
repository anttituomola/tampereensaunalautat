import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { prisma } from '../lib/prisma'
import { Lautta } from "../types"
import LauttaEl from "../components/LauttaEl"
import Filters from 'components/Filters'
import { useState } from 'react'

interface Props {
  saunas: Lautta[]
}

const Home: NextPage<Props> = ({ saunas }) => {
  const [filters, setFilters] = useState({
    location: '',
    capacity: 10,
  })

  // Show saunas based on filters
  const filteredSaunas = saunas.filter(sauna => {
    return (
      filters.location === sauna.location || filters.location === "" &&
      sauna.capacity >= filters.capacity
    )
  })

  return (
    <div className={styles.container}>
      <Head>
        <title>Tampereen saunalautat</title>
      </Head>
      <div className={styles.main}>
        <h1>Tampereen saunalautat</h1>
        <Filters setFilters={setFilters} filters={filters} />
        <div className="saunaContainer">
          {filteredSaunas.map(sauna => (
            <LauttaEl key={sauna.id} sauna={sauna} />
          ))}
        </div>
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