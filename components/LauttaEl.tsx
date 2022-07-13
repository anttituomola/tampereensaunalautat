import { Lautta } from "../types"

type Props = {
    sauna: Lautta
}
const LauttaEl = ({ sauna }: Props) => {
    return (
        <div className="lauttaEl">
            <h2>{sauna.name}</h2>
            <p>{sauna.capacity}</p>
        </div>
    )
}
export default LauttaEl