import Paper from '@mui/material/Paper'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { MobileTimePicker } from '@mui/x-date-pickers'
import { Alert, Button } from '@mui/material'
import styles from "styles/EmailForm.module.css"
import Snackbar from '@mui/material/Snackbar';
import dayjs from 'dayjs'
import * as EmailValidator from 'email-validator'
import { Saunalautta } from "types"
import 'dayjs/locale/fi'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(timezone)
dayjs.extend(utc)

type Props = {
    saunas: Saunalautta[]
}
const EmailForm = (props: Props) => {
    const [email, setEmail] = useState('')
    const [date, setDate] = useState("" || null)
    const [time, setTime] = useState('' || null)
    const [pax, setPax] = useState(10 || null)
    const [apiResponse, setApiResponse] = useState("")
    const [isDisabled, setIsDisabled] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const sendEmail = () => {
        setIsDisabled(true)
        const emailPromises = props.saunas.map(sauna => {
            const data = {
                emailTo: sauna.email,
                emailFrom: "info@tampereensaunalautat.fi",
                customerEmail: email,
                message: {
                    date: dayjs(date).tz('Europe/Helsinki') || null,
                    time: dayjs(time).tz('Europe/Helsinki') || null,
                    pax: pax || null,
                    sauna: sauna.name || ""
                }
            }
            console.log(data)
            if (!data.message.date || !data.message.time) {
                setAlertMessage("Päivämäärä ja lähtöaika ovat pakollisia")
                setAlertOpen(true)
                setIsDisabled(false)
                return
            }
            if (!EmailValidator.validate(data.customerEmail)) {
                setAlertMessage("Sähköposti ei ole oikea. Tarkista sähköpostiosoite.")
                setAlertOpen(true)
                setIsDisabled(false)
                return
            }
            if (data.message.pax === null || data.message.pax < 1) {
                setAlertMessage("Osallistujien lukumäärä ei voi olla pienempi kuin 1")
                setAlertOpen(true)
                setIsDisabled(false)
                return
            }
            return fetch('/api/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(res => {
                    setApiResponse(res.status)
                })
        })

        Promise.all(emailPromises)
            .then(() => {
                const saunaNames = props.saunas.map(sauna => sauna.name);
                const confirmationData = {
                    customerEmail: email,
                    tenderSummary: {
                        date: dayjs(date).tz('Europe/Helsinki'),
                        time: dayjs(time).tz('Europe/Helsinki'),
                        saunaNames: saunaNames
                    }
                }
                return fetch('/api/confirmatioEmailToCustomer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(confirmationData)
                })
            })
            .then(res => res.json())
            .then(res => {
                console.log('Confirmation email status:', res.status)
            })
            .catch(err => console.log(err))
    }

    if (apiResponse === "success") {
        return <div>
            <h1>Tarjouspyyntö lähetetty!</h1>
            <p>Lähetit tarjouspyynnön päivälle {dayjs(date).format("DD.MM.YYYY")} klo {dayjs(time).format("HH:mm")}</p>
            <p>Saat tarjoukset suoraan sähköpostiisi {email}.</p>
            <p>Kiitos kun käytit tampereensaunalautat.fi -sivusto!</p>
        </div>
    }

    if (apiResponse === "error") {
        return <div>
            <h1>Tarjouspyyntö epäonnistui!</h1>
            <p>Jokin meni pieleen. Yritä myöhemmin uudelleen.</p>
        </div>
    }

    return (
        <div className={styles.emailForm}>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
                <Alert onClose={() => setAlertOpen(false)} severity="error" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
            <Paper id={styles.paper}>
                <TextField required id="outlined-basic" type="email" label="Sähköpostiosoitteesi" variant="outlined" onChange={(event) => {
                    setEmail(event.target.value)
                }} />
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fi'>
                    <MobileDatePicker
                        minDate={dayjs()}
                        label="Päivämäärä"
                        inputFormat="DD/MM/YYYY"
                        value={date}
                        onChange={(newDate: any) => {
                            setDate(newDate)
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
                <Button size="large" disabled={isDisabled} variant="contained" onClick={() => sendEmail()}>LÄHETÄ</Button>
            </div>
        </div >
    )
}
export default EmailForm