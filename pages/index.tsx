import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import prisma from '../lib/prisma'
import { Lautta } from "../types"
import LauttaEl from "../components/LauttaEl"
import Filters from 'components/Filters'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'

interface Props {
  saunas: Lautta[]
}

const Home: NextPage<Props> = ({ saunas }) => {
  const initialState = {
    location: '',
    capacity: 0,
    sort: "",
    equipment: [
      { name: "WC", checked: false },
      { name: "Suihku", checked: false },
      { name: "Pukuhuone", checked: false },
      { name: "Kattoterassi", checked: false },
      { name: "Palju", checked: false },
      { name: "Poreallas", checked: false },
      { name: "Kylmäsäilytys", checked: false },
      { name: "Grilli", checked: false },
      { name: "TV", checked: false },
      { name: "Äänentoisto", checked: false },
      { name: "Mikro", checked: false },
    ]
  }
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(initialState)

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

  // Sort saunas based on pricemin or capacity
  const sortedSaunas = filteredSaunas.sort((a, b) => {
    if (filters.sort === "koko") {
      return b.capacity - a.capacity
    } else {
      return a.pricemin - b.pricemin
    }
  })

  // Show only saunas with checked equipment
  const selectedEquipment = filters.equipment.filter(equipment => equipment.checked)
  const filteredSaunasWithEquipment = sortedSaunas.filter(sauna => {
    return selectedEquipment.every(equipment => sauna.equipment.includes(equipment.name))
  })
  const hiddenSaunas = saunas.length - filteredSaunasWithEquipment.length


  return (
    <div className={styles.container}>
      <Head>
        <title>Tampereen saunalautat</title>
      </Head>

      <div className={styles.main}>
        <h1>Tampereen saunalautat</h1>

        {/* Show filters on click */}
        <Button sx={{ mb: 5 }} color={`${showFilters ? "error" : "primary"}`} variant="outlined" onClick={() => setShowFilters(!showFilters)}>Järjestä / suodata</Button>
        <Collapse in={showFilters}>
          {showFilters && <Filters setFilters={setFilters} filters={filters} />}
        </Collapse>
        {hiddenSaunas > 0 && <>
          <p className="hiddenSaunas">{`${hiddenSaunas} saunaa piilotettu.`}</p>
          <Button size="small" sx={{ mb: 5 }} color="secondary" variant="outlined" onClick={() => setFilters(initialState)}>Näytä kaikki saunat</Button>
        </>}
      </div>
      <main>

        <div className={styles.saunaContainer}>
          {filteredSaunasWithEquipment.map(sauna => (
            <Link href={`/saunat/${sauna.url_name}`} key={sauna.id}>
              <a>
                <LauttaEl key={sauna.id} sauna={sauna} />
              </a>
            </Link>
          ))}
        </div>
      </main>
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
