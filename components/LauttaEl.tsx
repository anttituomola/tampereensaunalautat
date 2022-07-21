import { Lautta } from "../types"
import Image from "next/image"
import styles from "/styles/LauttaEl.module.css"
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

type Props = {
    sauna: Lautta
}
const LauttaEl = ({ sauna }: Props) => {
    console.log()
    return (
        <>
            <div className={styles.lauttaEl} >
                <div className={styles.imageHolder}>
                    <Image className={styles.theImage} src={`/images/${sauna.mainImage}`} alt={sauna.name} layout="fill" />
                </div>
                <h2>{sauna.name}</h2>
                <p>{sauna.location}</p>
                <p>Alkaen {sauna.pricemin} € / {sauna.eventLength} h</p>
                <small>{sauna.notes}</small>
                <div>
                <Fab className={styles.lisaaPostitukseen} color="primary" size="small" aria-label="add">
                    <AddIcon />
                </Fab>

                </div>
            </div>

        </>
    )
}
export default LauttaEl