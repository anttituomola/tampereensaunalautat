type Filters = {
    location: string
    capacity: number
}

type Props = {
    setFilters: (filters: Filters) => void
    filters: Filters
}
const Filters = (props: Props) => {

    const locationSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.setFilters({
            ...props.filters,
            location: e.target.value
        })
    }

    const capacitySelector = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.setFilters({
            ...props.filters,
            capacity: Number(e.target.value)
        })
    }
    
    return (
        <div>
            <h2>Filters</h2>
            <p onChange={locationSelector}>Sijainti:
                Näsijärvi <input type="radio" value="Näsijärvi" name="location" />
                Pyhäjärvi <input type="radio" value="Pyhäjärvi" name="location" />
            </p>
            <p onChange={capacitySelector}>Henkilömäärä: {props.filters.capacity}
                <input type="range" min="1" max="20" name="capacity" value={props.filters.capacity}/>
            </p>
        </div>
    )
}
export default Filters