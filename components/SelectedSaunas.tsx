import { Lautta } from "types"

type Props = {
    saunasOnState: Lautta[]
}
const SelectedSaunas = (props: Props) => {
    return (
        <div>
            <h2>Valitut saunat</h2>
            {props.saunasOnState.map(sauna => {
                return <div key={sauna.id}>{sauna.name}</div>
            })}
        </div>
    )
}
export default SelectedSaunas