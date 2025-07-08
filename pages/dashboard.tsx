import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';
import { Saunalautta, SaunaEquipment } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getImageUrl } from '../lib/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [saunas, setSaunas] = useState<Saunalautta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserSaunas();
  }, []);

  const loadUserSaunas = async () => {
    try {
      setIsLoading(true);
      const userSaunas = await authAPI.getUserSaunas();
      // Transform the API response to match frontend types
      const transformedSaunas = userSaunas.map((sauna) => ({
        ...sauna,
        equipment: sauna.equipment as SaunaEquipment[],
      }));
      setSaunas(transformedSaunas);
    } catch (error) {
      console.error('Error loading saunas:', error);
      toast.error('Virhe saunojen lataamisessa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) {
      return `${min}€`;
    }
    return `${min}-${max}€`;
  };

  const getLocationColor = (location: string) => {
    return location.includes('Näsijärvi') ? 'primary' : 'secondary';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Container>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='50vh'
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth='lg'>
        <Head>
          <title>Hallintapaneeli - Tampereensaunalautat.fi</title>
          <meta name='description' content='Hallitse saunalauttojasi' />
        </Head>

        {/* Header */}
        <Box sx={{ py: 4 }}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={3}
          >
            <Box display='flex' alignItems='center' gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant='h4' component='h1'>
                  Tervetuloa, {user?.name}!
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {user?.email}
                </Typography>
                {user?.isAdmin && (
                  <Chip
                    icon={<AdminIcon />}
                    label='Ylläpitäjä'
                    color='warning'
                    size='small'
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Box>
            <Button
              variant='outlined'
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Kirjaudu ulos
            </Button>
          </Box>

          {/* Stats */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
              gap: 3,
              mb: 4,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant='h3' color='primary'>
                  {saunas.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {saunas.length === 1 ? 'Saunalautta' : 'Saunalauttaa'}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant='h3' color='secondary'>
                  {saunas.reduce((sum, sauna) => sum + sauna.capacity, 0)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Henkilöpaikkaa yhteensä
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant='h3' color='success.main'>
                  {saunas.length > 0
                    ? Math.min(...saunas.map((s) => s.pricemin))
                    : 0}
                  €
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Alhaisin hinta
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant='h3' color='error.main'>
                  {saunas.length > 0
                    ? Math.max(...saunas.map((s) => s.pricemax))
                    : 0}
                  €
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Korkein hinta
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Admin Section */}
          {user?.isAdmin && (
            <Alert severity='info' sx={{ mb: 4 }}>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>Ylläpitäjän työkalut</strong>
              </Typography>
              <Box display='flex' gap={2}>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => router.push('/admin/users')}
                >
                  Hallitse käyttäjiä
                </Button>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => router.push('/admin/pending')}
                >
                  Odottavat saunat
                </Button>
              </Box>
            </Alert>
          )}

          {/* Saunas */}
          <Typography variant='h5' gutterBottom>
            Saunalauttasi ({saunas.length})
          </Typography>

          {saunas.length === 0 ? (
            <Alert severity='info'>
              <Typography variant='body1'>
                Sinulla ei ole vielä saunoja järjestelmässä. Ota yhteyttä
                ylläpitoon saunan lisäämiseksi.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {saunas.map((sauna) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sauna.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {sauna.mainImage && (
                      <Box
                        component='img'
                        src={getImageUrl(sauna.mainImage)}
                        alt={sauna.name}
                        sx={{
                          height: 200,
                          objectFit: 'cover',
                          width: '100%',
                        }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant='h6' gutterBottom>
                        {sauna.name}
                      </Typography>

                      <Box display='flex' gap={1} mb={2}>
                        <Chip
                          label={sauna.location}
                          color={getLocationColor(sauna.location)}
                          size='small'
                        />
                        {sauna.winter && (
                          <Chip label='Talvikäyttö' color='info' size='small' />
                        )}
                      </Box>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        {sauna.capacity} henkilöä • {sauna.eventLength}h •{' '}
                        {formatPrice(sauna.pricemin, sauna.pricemax)}
                      </Typography>

                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Varusteet:</strong> {sauna.equipment.join(', ')}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        {sauna.email} • {sauna.phone}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size='small'
                        startIcon={<EditIcon />}
                        onClick={() => router.push(`/edit-sauna/${sauna.id}`)}
                      >
                        Muokkaa
                      </Button>
                      <Button
                        size='small'
                        onClick={() => router.push(`/saunat/${sauna.url_name}`)}
                      >
                        Näytä julkinen sivu
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Floating Action Button for adding new sauna (admin only) */}
        {user?.isAdmin && (
          <Fab
            color='primary'
            aria-label='add'
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => router.push('/add-sauna')}
          >
            <AddIcon />
          </Fab>
        )}
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;
