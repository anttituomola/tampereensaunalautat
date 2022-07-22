import Paper from '@mui/material/Paper'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { MobileTimePicker } from '@mui/x-date-pickers'
import { Button } from '@mui/material'
import styles from "styles/EmailForm.module.css"
import { Lautta } from "types"
import dayjs from 'dayjs'

interface Data {
    email: string
    date: string
    time: string
    pax: number
}

type Props = {
    saunas: Lautta[]
}
const EmailForm = (props: Props) => {
    const [email, setEmail] = useState('')
    const [date, setDate] = useState('' || null)
    const [time, setTime] = useState('' || null)
    const [pax, setPax] = useState(10 || null)

    const sendEmail = () => {
        props.saunas.map(sauna => {
            const data = {
                emailTo: "anttituomola8@gmail.com",
                emailFrom: "info@tampereensaunalautat.fi",
                customerEmail: email,
                message: {
                    date: date || null,
                    time: time || null,
                    pax: pax || null,
                    sauna: sauna.name || ""
                }
            }
            if (data.message.date && data.message.time) {
                fetch('/api/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(res => res.json())
                    .then(res => {
                        console.log(res)
                    }
                    )
                } else {
                    console.log("Päivämäärä ja lähtöaika ovat pakollisia")
                }
            })
    }



    return (
        <div className={styles.emailForm}>
            <Paper id={styles.paper}>
                <TextField required id="outlined-basic" type="email" label="Sähköpostiosoitteesi" variant="outlined" onChange={(event) => {
                    setEmail(event.target.value)
                }} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileDatePicker
                        minDate={dayjs()}
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
                    required
                    id="outlined-number"
                    label="Osallistujien lukumäärä"
                    type="number"
                    onChange={(event) => {
                        setPax(parseInt(event.target.value))
                    }}
                />
            </Paper>
            <div>
                <Button size="large" variant="contained" onClick={() => sendEmail()}>LÄHETÄ</Button>
            </div>
        </div >
    )
}
export default EmailForm