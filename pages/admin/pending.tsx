import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Group as CapacityIcon,
  AccessTime as TimeIcon,
  Euro as PriceIcon,
} from '@mui/icons-material';

import ProtectedRoute from '../../components/ProtectedRoute';
import { authAPI, PendingSauna } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const PendingRegistrations: React.FC = () => {
  const [pendingSaunas, setPendingSaunas] = useState<PendingSauna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSauna, setSelectedSauna] = useState<PendingSauna | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load pending registrations
  useEffect(() => {
    if (user?.isAdmin) {
      loadPendingSaunas();
    }
  }, [user]);

  const loadPendingSaunas = async () => {
    try {
      setIsLoading(true);
      const saunas = await authAPI.getPendingSaunas();
      setPendingSaunas(saunas);
    } catch (error) {
      console.error('Error loading pending saunas:', error);
      setSnackbar({
        open: true,
        message: 'Virhe ladattaessa odottavia rekisteröintejä',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sauna: PendingSauna) => {
    try {
      setActionLoading(sauna.id);
      const result = await authAPI.approvePendingSauna(sauna.id);

      setSnackbar({
        open: true,
        message: `Saunarekisteröinti hyväksytty! Sauna luotu URL-nimellä: ${result.urlName}`,
        severity: 'success',
      });

      // Reload the list
      await loadPendingSaunas();
    } catch (error) {
      console.error('Error approving sauna:', error);
      setSnackbar({
        open: true,
        message: 'Virhe saunarekisteröinnin hyväksymisessä',
        severity: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSauna) return;

    try {
      setActionLoading(selectedSauna.id);
      await authAPI.rejectPendingSauna(selectedSauna.id, rejectReason);

      setSnackbar({
        open: true,
        message: 'Saunarekisteröinti hylätty',
        severity: 'success',
      });

      // Close dialog and reload list
      setRejectDialogOpen(false);
      setSelectedSauna(null);
      setRejectReason('');
      await loadPendingSaunas();
    } catch (error) {
      console.error('Error rejecting sauna:', error);
      setSnackbar({
        open: true,
        message: 'Virhe saunarekisteröinnin hylkäämisessä',
        severity: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (sauna: PendingSauna) => {
    setSelectedSauna(sauna);
    setRejectDialogOpen(true);
  };

  const formatPrice = (min: number, max: number) => {
    return min === max ? `${min}€` : `${min}-${max}€`;
  };

  const formatEquipment = (equipmentStr: string) => {
    try {
      const equipment = JSON.parse(equipmentStr);
      return Array.isArray(equipment) ? equipment.join(', ') : equipmentStr;
    } catch {
      return equipmentStr;
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

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
          <title>
            Odottavat rekisteröinnit - Admin - Tampereensaunalautat.fi
          </title>
          <meta
            name='description'
            content='Hallitse odottavia saunarekisteröintejä'
          />
        </Head>

        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={4}
          >
            <Typography variant='h4' component='h1'>
              Odottavat saunarekisteröinnit
            </Typography>
            <Button
              variant='outlined'
              onClick={() => router.push('/dashboard')}
            >
              Takaisin hallintapaneeliin
            </Button>
          </Box>

          {/* Content */}
          {pendingSaunas.length === 0 ? (
            <Alert severity='info'>
              <Typography variant='body1'>
                Ei odottavia saunarekisteröintejä.
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                {pendingSaunas.length} odottavaa rekisteröintiä
              </Typography>

              <Grid container spacing={3}>
                {pendingSaunas.map((sauna) => (
                  <Grid size={{ xs: 12, lg: 6 }} key={sauna.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant='h6' gutterBottom>
                          {sauna.name}
                        </Typography>

                        <Box display='flex' gap={1} mb={2}>
                          <Chip
                            icon={<LocationIcon />}
                            label={sauna.location}
                            size='small'
                            color='default'
                          />
                          {sauna.winter && (
                            <Chip
                              label='Talvikäyttö'
                              color='info'
                              size='small'
                            />
                          )}
                        </Box>

                        <Box sx={{ mb: 2, '& > div': { mb: 1 } }}>
                          <Box display='flex' alignItems='center' gap={1}>
                            <CapacityIcon fontSize='small' />
                            <Typography variant='body2'>
                              {sauna.capacity} henkilöä
                            </Typography>
                          </Box>
                          <Box display='flex' alignItems='center' gap={1}>
                            <TimeIcon fontSize='small' />
                            <Typography variant='body2'>
                              {sauna.event_length}h
                            </Typography>
                          </Box>
                          <Box display='flex' alignItems='center' gap={1}>
                            <PriceIcon fontSize='small' />
                            <Typography variant='body2'>
                              {formatPrice(sauna.price_min, sauna.price_max)}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant='body2' sx={{ mb: 1 }}>
                          <strong>Varusteet:</strong>{' '}
                          {formatEquipment(sauna.equipment)}
                        </Typography>

                        {sauna.notes && (
                          <Typography variant='body2' sx={{ mb: 2 }}>
                            <strong>Lisätiedot:</strong> {sauna.notes}
                          </Typography>
                        )}

                        <Box sx={{ '& > div': { mb: 1 } }}>
                          <Box display='flex' alignItems='center' gap={1}>
                            <EmailIcon fontSize='small' />
                            <Typography variant='body2'>
                              {sauna.owner_email}
                            </Typography>
                          </Box>
                          <Box display='flex' alignItems='center' gap={1}>
                            <PhoneIcon fontSize='small' />
                            <Typography variant='body2'>
                              {sauna.phone}
                            </Typography>
                          </Box>
                          {sauna.url && (
                            <Typography variant='body2'>
                              <strong>Verkkosivu:</strong> {sauna.url}
                            </Typography>
                          )}
                        </Box>

                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mt: 2, display: 'block' }}
                        >
                          Lähetetty:{' '}
                          {new Date(sauna.created_at).toLocaleDateString(
                            'fi-FI'
                          )}
                        </Typography>
                      </CardContent>

                      <CardActions
                        sx={{ justifyContent: 'space-between', p: 2 }}
                      >
                        <Button
                          variant='contained'
                          color='success'
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApprove(sauna)}
                          disabled={actionLoading === sauna.id}
                          size='small'
                        >
                          {actionLoading === sauna.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            'Hyväksy'
                          )}
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          startIcon={<RejectIcon />}
                          onClick={() => openRejectDialog(sauna)}
                          disabled={actionLoading === sauna.id}
                          size='small'
                        >
                          Hylkää
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            Hylkää saunarekisteröinti: {selectedSauna?.name}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin='dense'
              label='Hylkäämisen syy (valinnainen)'
              fullWidth
              multiline
              rows={3}
              variant='outlined'
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder='Kerro syy hylkäämiselle...'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Peruuta</Button>
            <Button
              onClick={handleReject}
              color='error'
              variant='contained'
              disabled={actionLoading === selectedSauna?.id}
            >
              {actionLoading === selectedSauna?.id ? (
                <CircularProgress size={20} />
              ) : (
                'Hylkää rekisteröinti'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
};

export default PendingRegistrations;
