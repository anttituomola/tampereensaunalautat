import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import prisma from '../lib/prisma'
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
    if (filters.location === "ei väliä") {
      return sauna.capacity >= filters.capacity
    } else {
      return (
        sauna.location.toLowerCase().includes(filters.location.toLowerCase()) &&
        sauna.capacity >= filters.capacity
      )
    }
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
            <Link href={`/saunat/${sauna.name}`} key={sauna.id}>
              <a>
                <LauttaEl key={sauna.id} sauna={sauna} />
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div >
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
