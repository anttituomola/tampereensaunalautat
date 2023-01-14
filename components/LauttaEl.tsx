import { Lautta } from "../types"
import Image from "next/image"
import styles from "/styles/LauttaEl.module.css"
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import Link from 'next/link'
import { Saunalautta } from "../saunadata"

type Props = {
    sauna: Saunalautta,
    setSaunasOnState: React.Dispatch<React.SetStateAction<Saunalautta[]>>,
    saunasOnState: Saunalautta[]
}
const LauttaEl = ({ sauna, setSaunasOnState, saunasOnState }: Props) => {
    const addSaunaToState = (sauna: Saunalautta) => {
        if (saunasOnState.find(s => s.id === sauna.id)) {
            return
        }
        setSaunasOnState([...saunasOnState, sauna])
    }

    return (
        <>
            <div className={styles.lauttaEl} >
                <Link href={`/saunat/${sauna.url_name}`} key={sauna.id}>
                    <a>
                        <div className={styles.imageHolder}>
                            <Image className={styles.theImage} src={`/images/${sauna.mainImage}`} alt={sauna.name} layout="fill" priority/>
                        </div>
                        <h2>{sauna.name}</h2>
                    </a>
                </Link>
                <p>{sauna.location}</p>
                <p>Alkaen {sauna.pricemin} € / {sauna.eventLength} h</p>
                <small>{sauna.notes}</small>
                <div className={styles.lisaaPostitukseen}>
                    <Fab data-cy={`addButton-${sauna.name}`} color="primary" size="small" aria-label="add" onClick={() => addSaunaToState(sauna)}>
                        <AddIcon />
                    </Fab>

                </div>
            </div>

        </>
    )
}
export default LauttaEl