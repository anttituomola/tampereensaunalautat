import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import { Saunalautta, SaunaEquipment } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';
import ImageManager from '../../components/ImageManager';
import { toast } from 'react-toastify';

const EQUIPMENT_OPTIONS: SaunaEquipment[] = [
  'Kattoterassi',
  'Palju',
  'Äänentoisto',
  'Kahvinkeitin',
  'TV',
  'WC',
  'Suihku',
  'Grilli',
  'Kylmäsäilytys',
  'Pukuhuone',
  'Puulämmitteinen kiuas',
  'Jääkaappi',
  'Kaasugrilli',
  'Poreallas',
  'Jääpalakone',
  'Takka',
  'Ilmastointi',
  'Mikroaaltouuni',
  'Astiasto',
];

const LOCATION_OPTIONS = ['Näsijärvi', 'Pyhäjärvi'];

interface FormData {
  name: string;
  location: string;
  capacity: number;
  event_length: number;
  price_min: number;
  price_max: number;
  equipment: SaunaEquipment[];
  email: string;
  phone: string;
  url: string;
  url_array: string[];
  notes: string;
  winter: boolean;
  images: string[];
  mainImage: string | null;
}

interface FormErrors {
  name?: string;
  location?: string;
  capacity?: string;
  event_length?: string;
  price_min?: string;
  price_max?: string;
  email?: string;
  phone?: string;
  url?: string;
  url_array?: string;
  notes?: string;
}

const EditSauna: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [sauna, setSauna] = useState<Saunalautta | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    capacity: 0,
    event_length: 0,
    price_min: 0,
    price_max: 0,
    equipment: [],
    email: '',
    phone: '',
    url: '',
    url_array: [],
    notes: '',
    winter: false,
    images: [],
    mainImage: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadSauna(id);
    }
  }, [id]);

  const loadSauna = async (saunaId: string) => {
    try {
      setIsLoading(true);
      const userSaunas = await authAPI.getUserSaunas();
      const saunaData = userSaunas.find((s) => s.id === saunaId);

      if (!saunaData) {
        toast.error(
          'Saunaa ei löytynyt tai sinulla ei ole oikeuksia muokata sitä'
        );
        router.push('/dashboard');
        return;
      }

      setSauna(saunaData);
      setFormData({
        name: saunaData.name,
        location: saunaData.location,
        capacity: saunaData.capacity,
        event_length: saunaData.eventLength,
        price_min: saunaData.pricemin,
        price_max: saunaData.pricemax,
        equipment: saunaData.equipment,
        email: saunaData.email,
        phone: saunaData.phone,
        url: saunaData.url || '',
        url_array: saunaData.urlArray || [],
        notes: saunaData.notes || '',
        winter: saunaData.winter,
        images: saunaData.images || [],
        mainImage: saunaData.mainImage || null,
      });
    } catch (error) {
      console.error('Error loading sauna:', error);
      toast.error('Virhe saunan lataamisessa');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nimi on pakollinen';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nimi saa olla enintään 100 merkkiä';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Sijainti on pakollinen';
    }

    if (
      !formData.capacity ||
      formData.capacity < 1 ||
      formData.capacity > 100
    ) {
      newErrors.capacity = 'Henkilömäärä on oltava 1-100';
    }

    if (
      !formData.event_length ||
      formData.event_length < 1 ||
      formData.event_length > 24
    ) {
      newErrors.event_length = 'Tapahtuman kesto on oltava 1-24 tuntia';
    }

    if (!formData.price_min || formData.price_min < 0) {
      newErrors.price_min = 'Minimihinta on pakollinen ja oltava positiivinen';
    }

    if (!formData.price_max || formData.price_max < 0) {
      newErrors.price_max = 'Maksimihinta on pakollinen ja oltava positiivinen';
    }

    if (formData.price_min > formData.price_max) {
      newErrors.price_min =
        'Minimihinta ei voi olla suurempi kuin maksimihinta';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Sähköposti on pakollinen';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Sähköpostin muoto on virheellinen';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Puhelinnumero on pakollinen';
    } else if (!/^\+?[0-9\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Puhelinnumeron muoto on virheellinen';
    }

    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url =
        'Verkkosivun osoite on oltava muodossa http:// tai https://';
    }

    // Validate URL array
    for (let i = 0; i < formData.url_array.length; i++) {
      const url = formData.url_array[i];
      if (url && !/^https?:\/\/.+/.test(url)) {
        newErrors.url_array = `URL ${
          i + 1
        } on oltava muodossa http:// tai https://`;
        break;
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Lisätiedot voivat olla enintään 500 merkkiä';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleEquipmentChange = (
    equipment: SaunaEquipment,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, equipment]
        : prev.equipment.filter((e) => e !== equipment),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Lomakkeessa on virheitä. Tarkista kentät.');
      return;
    }

    try {
      setIsSaving(true);

      // Filter out empty URLs before saving
      const cleanedFormData = {
        ...formData,
        url_array: formData.url_array.filter((url) => url.trim() !== ''),
      };

      await authAPI.updateSauna(sauna!.id, cleanedFormData);
      toast.success('Saunan tiedot päivitetty onnistuneesti!');
      setHasChanges(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating sauna:', error);
      toast.error('Virhe saunan päivittämisessä');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm('Haluatko varmasti poistua tallentamatta muutoksia?')
      ) {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!sauna) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          Saunaa ei löytynyt tai sinulla ei ole oikeuksia muokata sitä.
        </Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Muokkaa saunaa - {sauna.name} | Tampereen Saunalautat</title>
        <meta
          name='description'
          content={`Muokkaa saunan ${sauna.name} tietoja`}
        />
      </Head>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box display='flex' alignItems='center' mb={4}>
          <IconButton onClick={() => router.push('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant='h4' component='h1'>
            Muokkaa saunaa: {sauna.name}
          </Typography>
        </Box>

        {/* Form */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom>
                  Perustiedot
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Saunan nimi'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.location}>
                  <InputLabel>Sijainti</InputLabel>
                  <Select
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    label='Sijainti'
                    required
                  >
                    {LOCATION_OPTIONS.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.location && (
                    <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                      {errors.location}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label='Henkilömäärä'
                  type='number'
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange('capacity', parseInt(e.target.value) || 0)
                  }
                  error={!!errors.capacity}
                  helperText={errors.capacity}
                  required
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label='Tapahtuman kesto (h)'
                  type='number'
                  value={formData.event_length}
                  onChange={(e) =>
                    handleInputChange(
                      'event_length',
                      parseInt(e.target.value) || 0
                    )
                  }
                  error={!!errors.event_length}
                  helperText={errors.event_length}
                  required
                  inputProps={{ min: 1, max: 24 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.winter}
                      onChange={(e) =>
                        handleInputChange('winter', e.target.checked)
                      }
                    />
                  }
                  label='Talvikäyttö'
                />
              </Grid>

              {/* Pricing */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Hinnoittelu
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Minimihinta (€)'
                  type='number'
                  value={formData.price_min}
                  onChange={(e) =>
                    handleInputChange(
                      'price_min',
                      parseInt(e.target.value) || 0
                    )
                  }
                  error={!!errors.price_min}
                  helperText={errors.price_min}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Maksimihinta (€)'
                  type='number'
                  value={formData.price_max}
                  onChange={(e) =>
                    handleInputChange(
                      'price_max',
                      parseInt(e.target.value) || 0
                    )
                  }
                  error={!!errors.price_max}
                  helperText={errors.price_max}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Contact Information */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Yhteystiedot
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Sähköposti'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Puhelinnumero'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Grid>

              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Verkkosivut
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label='Pääsivusto'
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  error={!!errors.url}
                  helperText={errors.url || 'Pääsivusto näytetään ensimmäisenä'}
                  placeholder='https://esimerkki.fi'
                  sx={{ mb: 2 }}
                />

                <Paper variant='outlined' sx={{ p: 2 }}>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    mb={2}
                  >
                    <Typography variant='subtitle1'>Lisäsivustot</Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          url_array: [...prev.url_array, ''],
                        }));
                        setHasChanges(true);
                      }}
                    >
                      + Lisää URL
                    </Button>
                  </Box>

                  {errors.url_array && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                      {errors.url_array}
                    </Alert>
                  )}

                  {formData.url_array.map((url, index) => (
                    <Box key={index} display='flex' gap={1} mb={1}>
                      <TextField
                        fullWidth
                        label={`URL ${index + 1}`}
                        value={url}
                        onChange={(e) => {
                          const newUrlArray = [...formData.url_array];
                          newUrlArray[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            url_array: newUrlArray,
                          }));
                          setHasChanges(true);
                        }}
                        placeholder='https://esimerkki.fi'
                        size='small'
                      />
                      <IconButton
                        onClick={() => {
                          const newUrlArray = formData.url_array.filter(
                            (_, i) => i !== index
                          );
                          setFormData((prev) => ({
                            ...prev,
                            url_array: newUrlArray,
                          }));
                          setHasChanges(true);
                        }}
                        color='error'
                        size='small'
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ))}

                  {formData.url_array.length === 0 && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontStyle: 'italic' }}
                    >
                      Ei lisäsivustoja. Klikkaa &quot;+ Lisää URL&quot;
                      lisätäksesi sosiaaliseen mediaan linkkejä,
                      varauskalentereita, tms.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Equipment */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Varusteet
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper variant='outlined' sx={{ p: 2 }}>
                  <FormGroup>
                    <Grid container spacing={1}>
                      {EQUIPMENT_OPTIONS.map((equipment) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={equipment}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.equipment.includes(equipment)}
                                onChange={(e) =>
                                  handleEquipmentChange(
                                    equipment,
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label={equipment}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                </Paper>
              </Grid>

              {/* Notes */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Lisätiedot
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Lisätiedot'
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  error={!!errors.notes}
                  helperText={
                    errors.notes || `${formData.notes.length}/500 merkkiä`
                  }
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>

              {/* Image Management */}
              <Grid size={12}>
                <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                  Kuvat
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ImageManager
                  saunaId={sauna.id}
                  images={formData.images}
                  mainImage={formData.mainImage}
                  onImagesUpdate={(newImages, newMainImage) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: newImages,
                      mainImage: newMainImage,
                    }));
                    setHasChanges(true);
                  }}
                  disabled={isSaving}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid size={12}>
                <Box
                  display='flex'
                  gap={2}
                  justifyContent='flex-end'
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant='outlined'
                    onClick={handleCancel}
                    disabled={isSaving}
                    startIcon={<CancelIcon />}
                  >
                    Peruuta
                  </Button>
                  <Button
                    variant='contained'
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={
                      isSaving ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                  >
                    {isSaving ? 'Tallentaa...' : 'Tallenna muutokset'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  );
};

export default EditSauna;
