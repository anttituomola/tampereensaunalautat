import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

import ProtectedRoute from '../../components/ProtectedRoute';
import ImageManager from '../../components/ImageManager';
import { authAPI, SaunaUpdateData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { SaunaEquipment } from '../../types';
import { toast } from 'react-toastify';

// Equipment options
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

const AddSauna: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: 'Näsijärvi',
    capacity: 8,
    event_length: 3,
    price_min: 250,
    price_max: 250,
    equipment: [] as SaunaEquipment[],
    email: '',
    phone: '',
    url: '',
    url_array: [] as string[],
    notes: '',
    winter: false,
    owner_email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  const steps = [
    'Perustiedot',
    'Yhteystiedot',
    'Varusteet & Lisätiedot',
    'Kuvat',
  ];

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic info
        if (!formData.name.trim()) newErrors.name = 'Nimi on pakollinen';
        if (formData.capacity < 1)
          newErrors.capacity = 'Henkilömäärä on pakollinen';
        if (formData.event_length < 1)
          newErrors.event_length = 'Tapahtuman kesto on pakollinen';
        if (formData.price_min < 0)
          newErrors.price_min = 'Hinta ei voi olla negatiivinen';
        if (formData.price_max < formData.price_min) {
          newErrors.price_max =
            'Maksimihinta ei voi olla pienempi kuin minimihinta';
        }
        break;
      case 1: // Contact info
        if (!formData.owner_email.trim())
          newErrors.owner_email = 'Omistajan sähköposti on pakollinen';
        if (!formData.email.trim())
          newErrors.email = 'Yhteystietojen sähköposti on pakollinen';
        if (!formData.phone.trim())
          newErrors.phone = 'Puhelinnumero on pakollinen';
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.owner_email && !emailRegex.test(formData.owner_email)) {
          newErrors.owner_email = 'Virheellinen sähköpostiosoite';
        }
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors.email = 'Virheellinen sähköpostiosoite';
        }
        break;
      case 2: // Equipment and notes
        if (formData.equipment.length === 0) {
          newErrors.equipment = 'Valitse vähintään yksi varuste';
        }
        if (formData.notes.length > 500) {
          newErrors.notes = 'Lisätiedot eivät voi olla yli 500 merkkiä';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
        : prev.equipment.filter((eq) => eq !== equipment),
    }));
  };

  const handleUrlArrayChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, url_array: urls }));
  };

  const addUrl = () => {
    if (formData.url.trim()) {
      handleUrlArrayChange([...formData.url_array, formData.url.trim()]);
      setFormData((prev) => ({ ...prev, url: '' }));
    }
  };

  const removeUrl = (index: number) => {
    handleUrlArrayChange(formData.url_array.filter((_, i) => i !== index));
  };

  const generateUrlName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(
        /[åäö]/g,
        (match) =>
          ({ å: 'a', ä: 'a', ö: 'o' }[match as 'å' | 'ä' | 'ö'] || match)
      )
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    // Validate all steps
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return;
      }
    }

    try {
      setIsLoading(true);

      // Create the sauna data
      const saunaData: any = {
        name: formData.name.trim(),
        url_name: generateUrlName(formData.name),
        location: formData.location,
        capacity: formData.capacity,
        event_length: formData.event_length,
        price_min: formData.price_min,
        price_max: formData.price_max,
        equipment: JSON.stringify(formData.equipment),
        images: JSON.stringify(images),
        main_image: images[0] || '',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        url: formData.url_array[0] || '',
        url_array: JSON.stringify(formData.url_array),
        notes: formData.notes.trim(),
        winter: formData.winter ? 1 : 0,
        owner_email: formData.owner_email.trim(),
      };

      const result = await authAPI.createSauna(saunaData);

      toast.success(`Sauna "${formData.name}" luotu onnistuneesti!`);
      router.push('/admin/saunas');
    } catch (error) {
      console.error('Error creating sauna:', error);
      toast.error('Virhe saunan luomisessa');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label='Saunan nimi *'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder='esim. Saunalautta Premium'
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Sijainti</InputLabel>
                <Select
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  label='Sijainti'
                >
                  <MenuItem value='Näsijärvi'>Näsijärvi</MenuItem>
                  <MenuItem value='Pyhäjärvi'>Pyhäjärvi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Henkilömäärä *'
                value={formData.capacity}
                onChange={(e) =>
                  handleInputChange('capacity', parseInt(e.target.value) || 0)
                }
                error={!!errors.capacity}
                helperText={errors.capacity}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Tapahtuman kesto (h) *'
                value={formData.event_length}
                onChange={(e) =>
                  handleInputChange(
                    'event_length',
                    parseInt(e.target.value) || 0
                  )
                }
                error={!!errors.event_length}
                helperText={errors.event_length}
                inputProps={{ min: 1, max: 24 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Minimihinta (€) *'
                value={formData.price_min}
                onChange={(e) =>
                  handleInputChange('price_min', parseInt(e.target.value) || 0)
                }
                error={!!errors.price_min}
                helperText={errors.price_min}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Maksimihinta (€) *'
                value={formData.price_max}
                onChange={(e) =>
                  handleInputChange('price_max', parseInt(e.target.value) || 0)
                }
                error={!!errors.price_max}
                helperText={errors.price_max}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.winter}
                    onChange={(e) =>
                      handleInputChange('winter', e.target.checked)
                    }
                  />
                }
                label='Talvikäyttö mahdollinen'
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                type='email'
                label='Omistajan sähköposti *'
                value={formData.owner_email}
                onChange={(e) =>
                  handleInputChange('owner_email', e.target.value)
                }
                error={!!errors.owner_email}
                helperText={
                  errors.owner_email || 'Käytetään käyttäjätilin luomiseen'
                }
                placeholder='omistaja@esimerkki.fi'
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                type='email'
                label='Yhteystietojen sähköposti *'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email || 'Näytetään asiakkaille'}
                placeholder='info@esimerkki.fi'
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label='Puhelinnumero *'
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder='040 123 4567'
              />
            </Grid>
            <Grid size={12}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Verkkosivut
                </Typography>
                <Box display='flex' gap={2} mb={2}>
                  <TextField
                    fullWidth
                    label='Lisää verkkosivu'
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder='https://www.esimerkki.fi'
                  />
                  <Button
                    variant='outlined'
                    onClick={addUrl}
                    disabled={!formData.url.trim()}
                  >
                    Lisää
                  </Button>
                </Box>
                {formData.url_array.map((url, index) => (
                  <Box
                    key={index}
                    display='flex'
                    alignItems='center'
                    gap={2}
                    mb={1}
                  >
                    <TextField fullWidth value={url} disabled size='small' />
                    <Button
                      size='small'
                      color='error'
                      onClick={() => removeUrl(index)}
                    >
                      Poista
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant='subtitle1' gutterBottom>
                Varusteet *
              </Typography>
              {errors.equipment && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {errors.equipment}
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <FormControlLabel
                    key={equipment}
                    control={
                      <Checkbox
                        checked={formData.equipment.includes(equipment)}
                        onChange={(e) =>
                          handleEquipmentChange(equipment, e.target.checked)
                        }
                      />
                    }
                    label={equipment}
                    sx={{ flexBasis: { xs: '100%', sm: '48%', md: '31%' } }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Lisätiedot'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                error={!!errors.notes}
                helperText={
                  errors.notes || `${formData.notes.length}/500 merkkiä`
                }
                placeholder='Vapaamuotoista tietoa saunasta...'
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant='subtitle1' gutterBottom>
              Saunan kuvat
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Lataa kuvia saunasta. Ensimmäinen kuva tulee pääkuvaksi.
            </Typography>
            {/* TODO: Implement ImageManager for new sauna creation */}
            <Alert severity='info'>
              Kuvien lataus toteutetaan myöhemmin. Voit lisätä kuvia saunan
              luomisen jälkeen muokkaamalla sitä.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth='md'>
        <Head>
          <title>Lisää sauna - Admin - Tampereensaunalautat.fi</title>
          <meta name='description' content='Lisää uusi sauna järjestelmään' />
        </Head>

        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box display='flex' alignItems='center' gap={2} mb={4}>
            <Tooltip title='Takaisin saunahallintaan'>
              <IconButton onClick={() => router.push('/admin/saunas')}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant='h4' component='h1'>
              Lisää uusi sauna
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              {renderStepContent(activeStep)}
            </CardContent>

            {/* Navigation */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
            >
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Edellinen
              </Button>
              <Box display='flex' gap={2}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={
                      isLoading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                  >
                    {isLoading ? 'Luodaan...' : 'Luo sauna'}
                  </Button>
                ) : (
                  <Button variant='contained' onClick={handleNext}>
                    Seuraava
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>
    </ProtectedRoute>
  );
};

export default AddSauna;
