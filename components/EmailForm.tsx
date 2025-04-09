import {
  Paper,
  TextField,
  Button,
  Stack,
  Box,
  CircularProgress,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { useState, useMemo } from 'react';
import styles from 'styles/EmailForm.module.css';
import dayjs from 'dayjs';
import * as EmailValidator from 'email-validator';
import { Saunalautta } from 'types';
import { toast } from 'react-toastify';
import 'dayjs/locale/fi';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
dayjs.extend(utc);

type Props = {
  saunas: Saunalautta[];
};

type ErrorState = {
  email: string;
  date: string;
  time: string;
  pax: string;
  message: string;
};

const EmailForm = (props: Props) => {
  const [email, setEmail] = useState('');
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [time, setTime] = useState<dayjs.Dayjs | null>(null);
  const [pax, setPax] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({
    email: '',
    date: '',
    time: '',
    pax: '',
    message: '',
  });

  const isFormValid = useMemo(() => {
    return (
      email && EmailValidator.validate(email) && date && time && pax && pax >= 1
    );
  }, [email, date, time, pax]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!email || !EmailValidator.validate(email)) {
      newErrors.email = 'Sähköpostiosoite ei ole kelvollinen';
      isValid = false;
    }

    if (!date) {
      newErrors.date = 'Päivämäärä on pakollinen';
      isValid = false;
    }

    if (!time) {
      newErrors.time = 'Lähtöaika on pakollinen';
      isValid = false;
    }

    if (!pax || pax < 1) {
      newErrors.pax = 'Osallistujien lukumäärä tulee olla vähintään 1';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // New function to verify email using the API
  const verifyEmail = async (email: string): Promise<boolean> => {
    try {
      console.log('Verifying email:', email);

      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        console.error('Email verification API error:', response.status);
        return true; // Continue with email sending on API errors to avoid blocking users
      }

      const data = await response.json();
      console.log('Verification result:', data);

      // Allow email if validation was skipped due to API issues
      if (data.message && data.message.includes('skipped')) {
        console.log('Email verification was skipped due to API issues');
        return true;
      }

      // If the email is not valid, show a more detailed error message based on the details
      if (!data.isValid && data.details) {
        const details = data.details;
        let errorMessage =
          'Annettu sähköpostiosoite ei vaikuta olevan käytössä tai ei voi vastaanottaa viestejä';

        // Use more specific error messages when available
        if (details.isValidFormat === false) {
          errorMessage = 'Sähköpostiosoitteen muoto on virheellinen';
        } else if (details.isDisposableEmail === true) {
          errorMessage = 'Kertakäyttöisiä sähköpostiosoitteita ei hyväksytä';
        }

        setErrors({
          ...errors,
          email: errorMessage,
        });
      }

      return data.isValid;
    } catch (error) {
      console.error('Email verification failed:', error);
      return true; // Continue with email sending on errors to avoid blocking users
    }
  };

  const sendEmail = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Verify the email with the API before proceeding
    const isValidEmail = await verifyEmail(email);

    if (!isValidEmail) {
      setIsLoading(false);
      return; // Error message already set by verifyEmail function
    }

    const emailPromises = props.saunas.map((sauna) => {
      const data = {
        emailTo: sauna.email,
        emailFrom: 'info@tampereensaunalautat.fi',
        customerEmail: email,
        message: {
          date: date,
          time: time,
          pax: pax,
          sauna: sauna.name,
          additionalInfo: message || undefined,
        },
      };

      return fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    });

    try {
      await Promise.all(emailPromises);

      const saunaNames = props.saunas.map((sauna) => sauna.name);
      const confirmationData = {
        customerEmail: email,
        tenderSummary: {
          date: date,
          time: time,
          saunaNames: saunaNames,
          additionalInfo: message || undefined,
        },
      };

      await fetch('/api/confirmatioEmailToCustomer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmationData),
      }).then((res) => res.json());

      toast.success('Tarjouspyyntö lähetetty onnistuneesti!');

      // Reset input fields
      setEmail('');
      setDate(null);
      setTime(null);
      setPax(10);
      setMessage('');
      setErrors({
        email: '',
        date: '',
        time: '',
        pax: '',
        message: '',
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Virhe tarjouspyynnön lähetyksessä. Yritä uudelleen.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.emailForm}>
      <Paper elevation={0} className={styles.formPaper}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id='email'
            type='email'
            label='Sähköpostiosoitteesi'
            variant='outlined'
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={!!errors.email}
            helperText={errors.email}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fi'>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <MobileDatePicker
                label='Päivämäärä *'
                minDate={dayjs()}
                value={date}
                onChange={(newDate: any) => {
                  setDate(newDate);
                  if (errors.date) setErrors({ ...errors, date: '' });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date,
                  },
                }}
              />
              <MobileTimePicker
                label='Lähtöaika *'
                ampm={false}
                value={time}
                onChange={(newValue) => {
                  setTime(newValue);
                  if (errors.time) setErrors({ ...errors, time: '' });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.time,
                    helperText: errors.time,
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
          <TextField
            required
            fullWidth
            id='pax'
            label='Osallistujien lukumäärä'
            type='number'
            value={pax}
            onChange={(event) => {
              setPax(parseInt(event.target.value));
              if (errors.pax) setErrors({ ...errors, pax: '' });
            }}
            error={!!errors.pax}
            helperText={errors.pax}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            fullWidth
            id='message'
            label='Lisätietoja (vapaaehtoinen)'
            multiline
            rows={4}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (errors.message) setErrors({ ...errors, message: '' });
            }}
            error={!!errors.message}
            helperText={errors.message}
            placeholder='Esim. erityistoiveet, kysymykset tai muut huomiot'
          />
          <Button
            size='large'
            disabled={isLoading || !isFormValid}
            variant='contained'
            onClick={sendEmail}
            fullWidth
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color='inherit' />
                Lähetetään...
              </Box>
            ) : (
              'LÄHETÄ TARJOUSPYYNTÖ'
            )}
          </Button>
        </Stack>
      </Paper>
    </div>
  );
};

export default EmailForm;
