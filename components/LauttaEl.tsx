import { Lautta } from "../types"
import Image from "next/image"

type Props = {
    sauna: Lautta
}
const LauttaEl = ({ sauna }: Props) => {
    console.log()
    return (
        <div className="lauttaEl">
            <div className="imageHolder">
                <Image className="theImage" src={`/images/${sauna.mainImage}`} alt={sauna.name} layout="fill" />
            </div>
            <h2>{sauna.name}</h2>
            <p>{sauna.location}</p>
            <p>Alkaen {sauna.pricemin} € / 3h</p>
            <small>{sauna.notes}</small>
        </div>
    )
}
export default LauttaEl