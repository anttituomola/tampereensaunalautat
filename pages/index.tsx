import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import LauttaEl from "../components/LauttaEl"
import Filters from 'components/Filters'
import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import SelectedSaunas from 'components/SelectedSaunas'
import { saunas } from '../saunadata'
import { Saunalautta } from '../saunadata'

interface Props {
    saunas: Saunalautta[]
}

const Home: NextPage<Props> = () => {
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
    const [saunasOnState, setSaunasOnState] = useState<Saunalautta[]>([])

    // Get initial saunasOnState from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.getItem('saunasOnState') ? setSaunasOnState(JSON.parse(localStorage.getItem('saunasOnState') || '[]')) : []
        }
    }
        , [])

    // Save saunasOnState to localStorage
    useEffect(() => {
        localStorage.setItem('saunasOnState', JSON.stringify(saunasOnState))
    }
        , [saunasOnState])

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

    // Show only saunas not in saunasOnState
    const filteredSaunasNotInSaunasOnState = filteredSaunasWithEquipment.filter(sauna => {
        return !saunasOnState.some(s => s.id === sauna.id)
    })

    return (
        <div className={styles.container}>
            <Head>
                <title>Tampereen saunalautat</title>
            </Head>

            <div className={styles.main}>
                <h1>Tampereen saunalautat</h1>
                {saunasOnState.length > 0 && <SelectedSaunas saunasOnState={saunasOnState} setSaunasOnState={setSaunasOnState} />}

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
                    {filteredSaunasNotInSaunasOnState.map(sauna => (

                        <LauttaEl key={sauna.id} sauna={sauna} saunasOnState={saunasOnState} setSaunasOnState={setSaunasOnState} />

                    ))}
                </div>

            </main>
        </div>
    )
}

export default Home
