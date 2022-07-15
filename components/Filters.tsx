import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'

type Filters = {
    location: string
    capacity: number
    sort: string
    equipment: string[]
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

    const capacitySelector = (event: Event, value: number | number[], activeThumb: number) => {
        props.setFilters({
            ...props.filters,
            capacity: value as number
        })
    }

    const sortSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.setFilters({
            ...props.filters,
            sort: e.target.value
        })
    }

    return (
        <div className="filters">
            <div>
                <FormControl>
                    <FormLabel id="location">Sijainti</FormLabel>
                    <RadioGroup
                        aria-labelledby="location"
                        defaultValue="ei väliä"
                        name="location-selector"
                        onChange={locationSelector}
                    >
                        <FormControlLabel value="Näsijärvi" control={<Radio />} label="Näsijärvi" />
                        <FormControlLabel value="Pyhäjärvi" control={<Radio />} label="Pyhäjärvi" />
                        <FormControlLabel value="ei väliä" control={<Radio />} label="Ei väliä" />

                    </RadioGroup>
                </FormControl>
            </div>
            <div className='slider'>
                <FormLabel id="capacity">Matkustajien lukumäärä</FormLabel>
                <Slider
                    aria-label="capacity"
                    aria-labelledby="capacity"
                    defaultValue={10}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={20}
                    onChange={capacitySelector}
                />
            </div>
            <div>
                <FormControl>
                    <FormLabel id="location">Järjestä</FormLabel>
                    <RadioGroup
                        aria-labelledby="location"
                        defaultValue=""
                        name="location-selector"
                        onChange={sortSelector}
                    >
                        <FormControlLabel value="hinta" control={<Radio />} label="Hinnan mukaan" />
                        <FormControlLabel value="koko" control={<Radio />} label="Koon mukaan" />
                    </RadioGroup>
                </FormControl>
            </div>
            <div>
                <p>Varusteiden suodatus</p>
            </div>
        </div>
    )
}
export default Filters