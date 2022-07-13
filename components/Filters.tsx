import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'

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

    const capacitySelector = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.setFilters({
            ...props.filters,
            capacity: Number(event.target.value)
        })
    }

    return (
        <div className="filters">
            <div>
                <FormControl>
                    <FormLabel id="location">Sijainti</FormLabel>
                    <RadioGroup
                        aria-labelledby="location"
                        defaultValue="Näsijärvi"
                        name="location-selector"
                        onChange={locationSelector}
                    >
                        <FormControlLabel value="Näsijärvi" control={<Radio />} label="Näsijärvi" />
                        <FormControlLabel value="Pyhäjärvi" control={<Radio />} label="Pyhäjärvi" />
                        <FormControlLabel value="" control={<Radio />} label="Ei väliä" />

                    </RadioGroup>
                </FormControl>
            </div>
            <div className='slider'>
            <FormLabel id="capacity">Matkustajien lukumäärä</FormLabel>
                <Slider
                    aria-label="capacity"
                    aria-labelledby="capacity"
                    defaultValue={30}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={20}
                    onChange={capacitySelector}
                />
            </div>
        </div>
    )
}
export default Filters