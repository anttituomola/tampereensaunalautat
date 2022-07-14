import { Lautta } from "../types"

type Props = {
    sauna: Lautta
}
const LauttaEl = ({ sauna }: Props) => {
    return (
        <div className="lauttaEl">
            <img src={sauna.mainImage} alt={sauna.name} height="200px" />
            <h2>{sauna.name}</h2>
            <p>{sauna.location}</p>
            <p>Alkaen {sauna.pricemin} € / 3h</p>
            <small>{sauna.notes}</small>
        </div>
    )
}
export default LauttaEl