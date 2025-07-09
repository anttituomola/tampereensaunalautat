import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Head from 'next/head';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { login, verifyToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const { token, returnUrl } = router.query;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination =
        typeof returnUrl === 'string' ? returnUrl : '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleTokenVerification = useCallback(
    async (magicToken: string) => {
      setIsLoading(true);
      try {
        const success = await verifyToken(magicToken);
        if (success) {
          const destination =
            typeof returnUrl === 'string' ? returnUrl : '/dashboard';
          router.push(destination);
        }
      } catch (error) {
        toast.error('Virhe kirjautumisessa. Yritä uudelleen.');
      } finally {
        setIsLoading(false);
      }
    },
    [verifyToken, returnUrl, router]
  );

  // Handle magic link verification
  useEffect(() => {
    if (token && typeof token === 'string') {
      handleTokenVerification(token);
    }
  }, [token, handleTokenVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Syötä sähköpostiosoite');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(email.trim());

      if (response.success) {
        setLinkSent(true);
        toast.success('Kirjautumislinkki lähetetty sähköpostiin!');
      } else {
        toast.error(response.message || 'Virhe kirjautumisessa');
      }
    } catch (error) {
      toast.error('Virhe kirjautumisessa. Yritä uudelleen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setLinkSent(false);
    setEmail('');
  };

  // Show loading if verifying token
  if (token && isLoading) {
    return (
      <Container maxWidth='sm'>
        <Head>
          <title>Kirjautuminen - Tampereensaunalautat.fi</title>
        </Head>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='80vh'
        >
          <CircularProgress size={60} />
          <Typography variant='h6' sx={{ mt: 2 }}>
            Kirjaudutaan sisään...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='sm'>
      <Head>
        <title>Kirjautuminen - Tampereensaunalautat.fi</title>
        <meta
          name='description'
          content='Kirjaudu sisään hallitaksesi saunalauttaasi'
        />
      </Head>

      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom align='center'>
            Kirjaudu sisään
          </Typography>

          <Typography
            variant='body1'
            sx={{ mb: 3 }}
            align='center'
            color='text.secondary'
          >
            Syötä sähköpostiosoitteesi, niin lähetämme sinulle
            kirjautumislinkin.
          </Typography>

          {linkSent ? (
            <Box>
              <Alert severity='success' sx={{ mb: 3 }}>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  <strong>Kirjautumislinkki lähetetty!</strong>
                </Typography>
                <Typography variant='body2'>
                  Tarkista sähköpostisi ja klikkaa kirjautumislinkkiä. Linkki on
                  voimassa 15 minuuttia.
                </Typography>
              </Alert>

              <Box display='flex' gap={2}>
                <Button variant='outlined' onClick={handleTryAgain} fullWidth>
                  Kokeile uudelleen
                </Button>
                <Button
                  variant='contained'
                  onClick={() => router.push('/')}
                  fullWidth
                >
                  Takaisin etusivulle
                </Button>
              </Box>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label='Sähköpostiosoite'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin='normal'
                required
                disabled={isLoading}
                placeholder='sinun@sahkoposti.fi'
                helperText='Käytä samaa sähköpostiosoitetta joka on saunalautallasi'
              />

              <Button
                type='submit'
                fullWidth
                variant='contained'
                size='large'
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Lähetetään...
                  </>
                ) : (
                  'Lähetä kirjautumislinkki'
                )}
              </Button>

              {/* Registration prompt */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1 }}
                >
                  Ei vielä tiliä?
                </Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => router.push('/register-sauna')}
                  size='medium'
                  disabled={isLoading}
                >
                  Rekisteröi saunalautta
                </Button>
              </Box>
            </form>
          )}

          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant='body2' color='text.secondary' align='center'>
              Ongelma kirjautumisessa? Ota yhteyttä:{' '}
              <a
                href='mailto:info@tampereensaunalautat.fi'
                style={{ color: 'inherit' }}
              >
                info@tampereensaunalautat.fi
              </a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
