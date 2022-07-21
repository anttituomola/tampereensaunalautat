import { Lautta } from "types"
import styles from "styles/SelectedSaunas.module.css"

type Props = {
    saunasOnState: Lautta[]
}
const SelectedSaunas = (props: Props) => {
    return (
        <div className={styles.selectedSaunas}>
            <h2>Valitut saunat</h2>
            {props.saunasOnState.map(sauna => {
                return <div key={sauna.id}>{sauna.name}</div>
            })}
        </div>
    )
}
export default SelectedSaunas