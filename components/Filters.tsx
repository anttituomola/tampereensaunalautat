import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import Checkbox from '@mui/material/Checkbox'
import styles from '/styles/Filters.module.css'

type Filters = {
    location: string
    capacity: number
    sort: string
    equipment: { name: string, checked: boolean }[]
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

    const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = {
            ...props.filters,
            equipment: props.filters.equipment.map(equipment => {
                if (equipment.name === e.target.name) {
                    return {
                        ...equipment,
                        checked: e.target.checked
                    }
                }
                return equipment
            })
        }
        props.setFilters(newFilters)
    }

    return (
        <div className={styles.filters}>
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
            <div className={styles.slider}>
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
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">Haluamasi varusteet</FormLabel>
                    <FormGroup className={styles.varusteet}>
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[0].checked} onChange={checkboxHandler} name="WC" />
                            }
                            label="WC"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[1].checked} onChange={checkboxHandler} name="Suihku" />
                            }
                            label="Suihku"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[2].checked} onChange={checkboxHandler} name="Pukuhuone" />
                            }
                            label="Pukuhuone"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox className='katto' checked={props.filters.equipment[3].checked} onChange={checkboxHandler} name="Kattoterassi" />
                            }
                            label="Kattoterassi"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[4].checked} onChange={checkboxHandler} name="Palju" />
                            }
                            label="Palju"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[5].checked} onChange={checkboxHandler} name="Poreallas" />
                            }
                            label="Poreallas"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[6].checked} onChange={checkboxHandler} name="Kylmäsäilytys" />
                            }
                            label="Kylmäsäilytys"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[7].checked} onChange={checkboxHandler} name="Grilli" />
                            }
                            label="Grilli"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[8].checked} onChange={checkboxHandler} name="TV" />
                            }
                            label="TV"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[9].checked} onChange={checkboxHandler} name="Äänentoisto" />
                            }
                            label="Äänentoisto"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox checked={props.filters.equipment[10].checked} onChange={checkboxHandler} name="Mikro" />
                            }
                            label="Mikro"
                        />
                    </FormGroup>
                    <FormHelperText>Valitse kaikki haluamasi</FormHelperText>
                </FormControl>
            </div>
        </div >
    )
}
export default Filters