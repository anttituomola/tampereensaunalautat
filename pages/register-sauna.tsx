import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  House as HouseIcon,
  Build as BuildIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import RegistrationWizard from '../components/RegistrationWizard';

const RegisterSauna: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmissionComplete = () => {
    setIsSubmitted(true);
  };

  const handleSubmissionError = (error: string) => {
    setSubmitError(error);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <>
        <Head>
          <title>Rekisteröinti lähetetty - Tampereensaunalautat.fi</title>
          <meta
            name='description'
            content='Saunalautatrekisteröinti on lähetetty onnistuneesti'
          />
        </Head>

        <Container maxWidth='md' sx={{ py: 4 }}>
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography variant='h4' gutterBottom>
              Rekisteröinti lähetetty!
            </Typography>
            <Typography variant='body1' sx={{ mb: 3 }}>
              Kiitos rekisteröinnistä! Saunalauttasi tiedot on lähetetty
              ylläpitäjille tarkistettavaksi. Saat sähköpostiviestin, kun
              rekisteröinti on käsitelty.
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              Käsittelyaika on yleensä 1-3 arkipäivää. Jos sinulla on
              kysyttävää, ota yhteyttä sähköpostitse.
            </Typography>
            <Box>
              <Button
                component={Link}
                href='/'
                variant='contained'
                color='primary'
                size='large'
                sx={{ mr: 2 }}
              >
                Takaisin etusivulle
              </Button>
              <Button
                component={Link}
                href='/register-sauna'
                variant='outlined'
                size='large'
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmitError(null);
                }}
              >
                Rekisteröi toinen saunasilta
              </Button>
            </Box>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Rekisteröi saunasilta - Tampereensaunalautat.fi</title>
        <meta
          name='description'
          content='Rekisteröi saunalattasi Tampereensaunalautat.fi -palveluun'
        />
      </Head>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign='center' mb={4}>
          <Typography variant='h3' component='h1' gutterBottom>
            Rekisteröi saunasilta
          </Typography>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            Liitä saunasiltasi Tampereen saunalautta-palveluun
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Täytä alla oleva lomake rekisteröidäksesi saunalautasi
            listaukseemme. Kaikki rekisteröinnit tarkastetaan ennen julkaisua.
          </Typography>
        </Box>

        {submitError && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        {isSubmitting && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant='body2' textAlign='center' sx={{ mt: 1 }}>
              Lähetetään rekisteröintiä...
            </Typography>
          </Box>
        )}

        {/* Registration Form */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <RegistrationWizard
              onSubmissionComplete={handleSubmissionComplete}
              onSubmissionError={handleSubmissionError}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </CardContent>
        </Card>

        {/* Information Box */}
        <Box mt={4}>
          <Alert severity='info'>
            <Typography variant='body2'>
              <strong>Tietoa rekisteröinnistä:</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Kaikki rekisteröinnit tarkastetaan ennen julkaisua</li>
              <li>Saat vahvistusviestin sähköpostitse</li>
              <li>Voit muokata tietojasi kirjautumisen jälkeen</li>
              <li>Palvelu on ilmainen saunalautan omistajille</li>
            </ul>
          </Alert>
        </Box>
      </Container>
    </>
  );
};

export default RegisterSauna;
