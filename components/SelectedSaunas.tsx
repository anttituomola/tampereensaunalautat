import { Lautta } from "types"
import styles from "styles/SelectedSaunas.module.css"
import EmailForm from "components/EmailForm"
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'

type Props = {
    saunasOnState: Lautta[],
    setSaunasOnState: (saunasOnState: Lautta[]) => void
}

const SelectedSaunas = (props: Props) => {
    const removeSauna = (sauna: Lautta) => {
        const newSaunasOnState = props.saunasOnState.filter(s => s.id !== sauna.id)
        props.setSaunasOnState(newSaunasOnState)
    }

    return (
        <div className={styles.selectedSaunas}>
            <h2>Valitut saunat</h2>
            {props.saunasOnState.map(sauna => {
                return <>
                    <div key={sauna.id}>{sauna.name}
                        <Button variant="text" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => removeSauna(sauna)} />
                    </div>

                </>
            })}
            <EmailForm />
        </div>
    )
}
export default SelectedSaunas