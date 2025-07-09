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
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Group as CapacityIcon,
  Euro as PriceIcon,
  Image as ImageIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

import ProtectedRoute from '../../components/ProtectedRoute';
import { fetchSaunas, getImageUrl, authAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Saunalautta } from '../../types';
import { toast } from 'react-toastify';

const AdminSaunasManagement: React.FC = () => {
  const [saunas, setSaunas] = useState<Saunalautta[]>([]);
  const [filteredSaunas, setFilteredSaunas] = useState<Saunalautta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saunaToDelete, setSaunaToDelete] = useState<Saunalautta | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load all saunas
  useEffect(() => {
    if (user?.isAdmin) {
      loadSaunas();
    }
  }, [user]);

  // Filter saunas based on search and filters
  useEffect(() => {
    let filtered = saunas;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sauna) =>
          sauna.name.toLowerCase().includes(searchLower) ||
          sauna.location.toLowerCase().includes(searchLower) ||
          sauna.email.toLowerCase().includes(searchLower) ||
          sauna.equipment.some((eq: string) =>
            eq.toLowerCase().includes(searchLower)
          )
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((sauna) => sauna.location === locationFilter);
    }

    setFilteredSaunas(filtered);
  }, [saunas, searchTerm, locationFilter]);

  const loadSaunas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const saunasData = await fetchSaunas();
      setSaunas(saunasData);
    } catch (error) {
      console.error('Error loading saunas:', error);
      setError('Virhe saunojen lataamisessa');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (min: number, max: number) => {
    return min === max ? `${min}€` : `${min}-${max}€`;
  };

  const getLocationColor = (location: string) => {
    return location.includes('Näsijärvi') ? 'primary' : 'secondary';
  };

  const getUniqueLocations = () => {
    return Array.from(new Set(saunas.map((sauna) => sauna.location)));
  };

  const getStatistics = () => {
    return {
      total: saunas.length,
      totalCapacity: saunas.reduce((sum, sauna) => sum + sauna.capacity, 0),
      avgPrice:
        saunas.length > 0
          ? Math.round(
              saunas.reduce(
                (sum, sauna) => sum + (sauna.pricemin + sauna.pricemax) / 2,
                0
              ) / saunas.length
            )
          : 0,
      locations: getUniqueLocations().length,
      withImages: saunas.filter((sauna) => sauna.images.length > 0).length,
      winterSaunas: saunas.filter((sauna) => sauna.winter).length,
    };
  };

  const handleToggleVisibility = async (sauna: Saunalautta) => {
    try {
      setIsPerformingAction(true);
      const newVisibility = !sauna.visible;
      const message = await authAPI.toggleSaunaVisibility(
        sauna.id,
        newVisibility
      );

      // Update local state
      setSaunas((prevSaunas) =>
        prevSaunas.map((s) =>
          s.id === sauna.id ? { ...s, visible: newVisibility } : s
        )
      );

      toast.success(message);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Virhe näkyvyyden vaihtamisessa');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleDeleteClick = (sauna: Saunalautta) => {
    setSaunaToDelete(sauna);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!saunaToDelete) return;

    try {
      setIsPerformingAction(true);
      const message = await authAPI.deleteSauna(saunaToDelete.id);

      // Remove from local state
      setSaunas((prevSaunas) =>
        prevSaunas.filter((s) => s.id !== saunaToDelete.id)
      );

      toast.success(message);
      setDeleteDialogOpen(false);
      setSaunaToDelete(null);
    } catch (error) {
      console.error('Error deleting sauna:', error);
      toast.error('Virhe saunan poistamisessa');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSaunaToDelete(null);
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

  if (error) {
    return (
      <ProtectedRoute>
        <Container>
          <Box sx={{ py: 4 }}>
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant='contained' onClick={loadSaunas}>
              Yritä uudelleen
            </Button>
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  const stats = getStatistics();

  return (
    <ProtectedRoute>
      <Container maxWidth='xl'>
        <Head>
          <title>Saunahallinta - Admin - Tampereensaunalautat.fi</title>
          <meta
            name='description'
            content='Hallitse kaikkia saunoja järjestelmässä'
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
              Saunahallinta
            </Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => router.push('/admin/add-sauna')}
              >
                Lisää sauna
              </Button>
              <Button
                variant='outlined'
                onClick={() => router.push('/dashboard')}
              >
                Takaisin hallintapaneeliin
              </Button>
            </Box>
          </Box>

          {/* Statistics */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                sm: '1fr 1fr 1fr',
                md: '1fr 1fr 1fr 1fr 1fr 1fr',
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='primary'>
                {stats.total}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Saunaa yhteensä
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='secondary'>
                {stats.totalCapacity}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Henkilöpaikkaa
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='success.main'>
                {stats.avgPrice}€
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Keskihinta
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='info.main'>
                {stats.locations}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sijaintia
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='warning.main'>
                {stats.withImages}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Kuvien kanssa
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='error.main'>
                {stats.winterSaunas}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Talvikäyttöä
              </Typography>
            </Paper>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={2}>
              <FilterIcon />
              <Typography variant='h6'>Suodattimet ja haku</Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '2fr 1fr 1fr',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                fullWidth
                placeholder='Hae saunan nimellä, sijainnilla, sähköpostilla tai varusteilla...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Sijainti</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  label='Sijainti'
                >
                  <MenuItem value=''>Kaikki sijainnit</MenuItem>
                  {getUniqueLocations().map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={viewMode === 'table'}
                    onChange={(e) =>
                      setViewMode(e.target.checked ? 'table' : 'cards')
                    }
                  />
                }
                label='Taulukkonäkymä'
              />
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
              Näytetään {filteredSaunas.length} / {saunas.length} saunaa
            </Typography>
          </Paper>

          {/* Results */}
          {filteredSaunas.length === 0 ? (
            <Alert severity='info'>
              <Typography variant='body1'>
                {searchTerm || locationFilter
                  ? 'Hakuehdoilla ei löytynyt saunoja.'
                  : 'Ei saunoja järjestelmässä.'}
              </Typography>
            </Alert>
          ) : viewMode === 'cards' ? (
            /* Card View */
            <Grid container spacing={3}>
              {filteredSaunas.map((sauna) => (
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

                      <Box display='flex' gap={1} mb={2} flexWrap='wrap'>
                        <Chip
                          icon={<LocationIcon />}
                          label={sauna.location}
                          color={getLocationColor(sauna.location)}
                          size='small'
                        />
                        {sauna.winter && (
                          <Chip label='Talvikäyttö' color='info' size='small' />
                        )}
                        {sauna.images.length > 0 && (
                          <Chip
                            icon={<ImageIcon />}
                            label={`${sauna.images.length} kuvaa`}
                            size='small'
                          />
                        )}
                      </Box>

                      <Box sx={{ mb: 2, '& > div': { mb: 1 } }}>
                        <Box display='flex' alignItems='center' gap={1}>
                          <CapacityIcon fontSize='small' />
                          <Typography variant='body2'>
                            {sauna.capacity} henkilöä • {sauna.eventLength}h
                          </Typography>
                        </Box>
                        <Box display='flex' alignItems='center' gap={1}>
                          <PriceIcon fontSize='small' />
                          <Typography variant='body2'>
                            {formatPrice(sauna.pricemin, sauna.pricemax)}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Varusteet:</strong>{' '}
                        {sauna.equipment.slice(0, 3).join(', ')}
                        {sauna.equipment.length > 3 && '...'}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        {sauna.email} • {sauna.phone}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <Tooltip title='Muokkaa saunaa'>
                          <IconButton
                            size='small'
                            onClick={() =>
                              router.push(`/edit-sauna/${sauna.id}`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Näytä julkinen sivu'>
                          <IconButton
                            size='small'
                            onClick={() =>
                              router.push(`/saunat/${sauna.url_name}`)
                            }
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            sauna.visible ? 'Piilota sauna' : 'Näytä sauna'
                          }
                        >
                          <IconButton
                            size='small'
                            onClick={() => handleToggleVisibility(sauna)}
                            disabled={isPerformingAction}
                            color={sauna.visible ? 'primary' : 'default'}
                          >
                            {sauna.visible ? <ViewIcon /> : <HideIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Poista sauna'>
                          <IconButton
                            size='small'
                            onClick={() => handleDeleteClick(sauna)}
                            disabled={isPerformingAction}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box textAlign='right'>
                        <Typography variant='caption' color='text.secondary'>
                          ID: {sauna.id.slice(-8)}
                        </Typography>
                        <br />
                        <Chip
                          label={sauna.visible ? 'Näkyy' : 'Piilotettu'}
                          color={sauna.visible ? 'success' : 'default'}
                          size='small'
                        />
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Table View */
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sauna</TableCell>
                      <TableCell>Sijainti</TableCell>
                      <TableCell align='center'>Henkilöä</TableCell>
                      <TableCell align='center'>Hinta</TableCell>
                      <TableCell align='center'>Kuvat</TableCell>
                      <TableCell align='center'>Talvi</TableCell>
                      <TableCell align='center'>Näkyvyys</TableCell>
                      <TableCell>Yhteystiedot</TableCell>
                      <TableCell align='center'>Toiminnot</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSaunas.map((sauna) => (
                      <TableRow
                        key={sauna.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={2}>
                            {sauna.mainImage ? (
                              <Avatar
                                src={getImageUrl(sauna.mainImage)}
                                alt={sauna.name}
                                sx={{ width: 40, height: 40 }}
                              />
                            ) : (
                              <Avatar sx={{ width: 40, height: 40 }}>
                                {sauna.name.charAt(0)}
                              </Avatar>
                            )}
                            <Box>
                              <Typography variant='body2' fontWeight='medium'>
                                {sauna.name}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {sauna.url_name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sauna.location}
                            color={getLocationColor(sauna.location)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2'>
                            {sauna.capacity}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2'>
                            {formatPrice(sauna.pricemin, sauna.pricemax)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={sauna.images.length.toString()}
                            color={
                              sauna.images.length > 0 ? 'primary' : 'default'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          {sauna.winter ? (
                            <ActiveIcon color='success' />
                          ) : (
                            <InactiveIcon color='disabled' />
                          )}
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={sauna.visible ? 'Näkyy' : 'Piilotettu'}
                            color={sauna.visible ? 'success' : 'default'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{sauna.email}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {sauna.phone}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Box display='flex' justifyContent='center' gap={1}>
                            <Tooltip title='Muokkaa'>
                              <IconButton
                                size='small'
                                onClick={() =>
                                  router.push(`/edit-sauna/${sauna.id}`)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Näytä julkinen sivu'>
                              <IconButton
                                size='small'
                                onClick={() =>
                                  router.push(`/saunat/${sauna.url_name}`)
                                }
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                sauna.visible ? 'Piilota sauna' : 'Näytä sauna'
                              }
                            >
                              <IconButton
                                size='small'
                                onClick={() => handleToggleVisibility(sauna)}
                                disabled={isPerformingAction}
                                color={sauna.visible ? 'primary' : 'default'}
                              >
                                {sauna.visible ? <ViewIcon /> : <HideIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Poista sauna'>
                              <IconButton
                                size='small'
                                onClick={() => handleDeleteClick(sauna)}
                                disabled={isPerformingAction}
                                color='error'
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'
        >
          <DialogTitle id='delete-dialog-title'>Poista sauna</DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              Haluatko varmasti poistaa saunan "{saunaToDelete?.name}"?
              <br />
              <br />
              <strong>Tämä toiminto ei ole peruutettavissa!</strong>
              <br />
              Sauna poistetaan järjestelmästä pysyvästi ja kaikki siihen
              liittyvät tiedot menetetään.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isPerformingAction}>
              Peruuta
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color='error'
              variant='contained'
              disabled={isPerformingAction}
              startIcon={
                isPerformingAction ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {isPerformingAction ? 'Poistetaan...' : 'Poista sauna'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
};

export default AdminSaunasManagement;
