import Paper from '@mui/material/Paper'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { MobileTimePicker } from '@mui/x-date-pickers'
import { Button } from '@mui/material'
import styles from "styles/EmailForm.module.css"

type Props = {}
const EmailForm = (props: Props) => {
    const [email, setEmail] = useState('')
    const [date, setDate] = useState('' || null)
    const [time, setTime] = useState('' || null)
    const [pax, setPax] = useState(10 || null)


    return (
        <div className={styles.emailForm}>
            <h2>Lähetä tarjouspyyntö valituille saunalautoille</h2>
            <Paper id={styles.paper}>
                <TextField id="outlined-basic" type="email" label="Sähköpostiosoitteesi" variant="outlined" onChange={(event) => {
                    setEmail(event.target.value)
                }} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileDatePicker
                        label="Päivämäärä"
                        inputFormat="DD/MM/YYYY"
                        value={date}
                        onChange={(newValue) => {
                            setDate(newValue)
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <MobileTimePicker
                        ampm={false}
                        label="Lähtöaika"
                        value={time}
                        onChange={(newValue) => {
                            setTime(newValue)
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <TextField
                    id="outlined-number"
                    label="Osallistujien lukumäärä"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={(event) => {
                        setPax(parseInt(event.target.value))
                    }}
                />
            </Paper>
            <div>
                <Button size="large" variant="contained" onClick={() => console.log(email, date, time, pax)}>LÄHETÄ</Button>
            </div>
        </div >
    )
}
export default EmailForm