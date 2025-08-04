import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  House as HouseIcon,
  Build as BuildIcon,
  PhotoCamera as PhotoCameraIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { SaunaEquipment } from '../types';
import RegistrationImageManager from './RegistrationImageManager';

// Step icons
const stepIcons = [
  PersonAddIcon,
  HouseIcon,
  BuildIcon,
  PhotoCameraIcon,
  AssignmentIcon,
];

const steps = [
  'Yhteystiedot',
  'Saunan tiedot',
  'Varusteet',
  'Kuvat',
  'Ehdot ja yhteenveto',
];

const mobileSteps = ['Yhteystiedot', 'Tiedot', 'Varusteet', 'Kuvat', 'Ehdot'];

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

interface RegistrationFormData {
  // Owner information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;

  // Sauna details
  saunaName: string;
  location: string;
  capacity: number;
  eventLength: number;
  priceMin: number;
  priceMax: number;

  // Contact details
  contactEmail: string;
  contactPhone: string;
  website: string;
  additionalUrls: string[];

  // Equipment and features
  equipment: SaunaEquipment[];
  winterAvailable: boolean;
  notes: string;

  // Images (File objects before upload)
  images: File[];
  mainImageIndex: number | null;

  // Terms acceptance
  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface RegistrationWizardProps {
  onSubmissionComplete: () => void;
  onSubmissionError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  onSubmissionComplete,
  onSubmissionError,
  isSubmitting,
  setIsSubmitting,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    saunaName: '',
    location: '',
    capacity: 0,
    eventLength: 0,
    priceMin: 0,
    priceMax: 0,
    contactEmail: '',
    contactPhone: '',
    website: '',
    additionalUrls: [''],
    equipment: [],
    winterAvailable: false,
    notes: '',
    images: [],
    mainImageIndex: null,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Save form data to localStorage (excluding File objects)
  const saveToLocalStorage = (data: RegistrationFormData) => {
    try {
      const { images, ...dataToSave } = data;
      localStorage.setItem(
        'sauna-registration-draft',
        JSON.stringify(dataToSave)
      );
    } catch (error) {
      console.warn('Could not save form data to localStorage:', error);
    }
  };

  // Load form data from localStorage (images will remain empty)
  const loadFromLocalStorage = (): Partial<RegistrationFormData> | null => {
    try {
      const saved = localStorage.getItem('sauna-registration-draft');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Could not load form data from localStorage:', error);
      return null;
    }
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('sauna-registration-draft');
    } catch (error) {
      console.warn('Could not clear localStorage:', error);
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      // Prepare the complete data with auto-fill
      const completeData = { ...savedData };

      // Auto-fill contact details if we have owner data but no contact data
      if (savedData.ownerEmail && !savedData.contactEmail) {
        completeData.contactEmail = savedData.ownerEmail;
      }
      if (savedData.ownerPhone && !savedData.contactPhone) {
        completeData.contactPhone = savedData.ownerPhone;
      }

      setFormData((prev) => ({ ...prev, ...completeData }));
    }
  }, []);

  // Auto-fill contact details when moving to sauna details step
  const autoFillContactDetails = () => {
    // Use a timeout to ensure this runs after current state updates
    setTimeout(() => {
      setFormData((currentData) => {
        let needsUpdate = false;
        let newFormData = { ...currentData };

        if (currentData.ownerEmail && !currentData.contactEmail) {
          newFormData.contactEmail = currentData.ownerEmail;
          needsUpdate = true;
        }

        if (currentData.ownerPhone && !currentData.contactPhone) {
          newFormData.contactPhone = currentData.ownerPhone;
          needsUpdate = true;
        }

        if (needsUpdate) {
          saveToLocalStorage(newFormData);
          return newFormData;
        }

        return currentData;
      });
    }, 10);
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEquipmentChange = (
    equipment: SaunaEquipment,
    checked: boolean
  ) => {
    const newFormData = {
      ...formData,
      equipment: checked
        ? [...formData.equipment, equipment]
        : formData.equipment.filter((e) => e !== equipment),
    };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const handleUrlArrayChange = (index: number, value: string) => {
    const newUrls = [...formData.additionalUrls];
    newUrls[index] = value;

    // Add new empty field if this is the last field and it's not empty
    if (index === newUrls.length - 1 && value.trim() !== '') {
      newUrls.push('');
    }

    // Remove empty fields from the middle
    const filteredUrls = newUrls.filter(
      (url, i) => i === newUrls.length - 1 || url.trim() !== ''
    );

    const newFormData = { ...formData, additionalUrls: filteredUrls };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Owner information
        if (!formData.ownerName.trim()) {
          newErrors.ownerName = 'Nimi on pakollinen';
        }
        if (!formData.ownerEmail.trim()) {
          newErrors.ownerEmail = 'Sähköposti on pakollinen';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          newErrors.ownerEmail = 'Sähköpostin muoto on virheellinen';
        }
        if (!formData.ownerPhone.trim()) {
          newErrors.ownerPhone = 'Puhelinnumero on pakollinen';
        } else if (!/^\+?[0-9\s\-()]{7,}$/.test(formData.ownerPhone)) {
          newErrors.ownerPhone = 'Puhelinnumeron muoto on virheellinen';
        }
        break;

      case 1: // Sauna details
        if (!formData.saunaName.trim()) {
          newErrors.saunaName = 'Saunan nimi on pakollinen';
        } else if (formData.saunaName.length > 100) {
          newErrors.saunaName = 'Nimi saa olla enintään 100 merkkiä';
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
          !formData.eventLength ||
          formData.eventLength < 1 ||
          formData.eventLength > 24
        ) {
          newErrors.eventLength = 'Tapahtuman kesto on oltava 1-24 tuntia';
        }
        if (!formData.priceMin || formData.priceMin < 0) {
          newErrors.priceMin =
            'Minimihinta on pakollinen ja oltava positiivinen';
        }
        if (!formData.priceMax || formData.priceMax < 0) {
          newErrors.priceMax =
            'Maksimihinta on pakollinen ja oltava positiivinen';
        }
        if (formData.priceMin > formData.priceMax) {
          newErrors.priceMin =
            'Minimihinta ei voi olla suurempi kuin maksimihinta';
        }

        // Contact details validation
        if (!formData.contactEmail.trim()) {
          newErrors.contactEmail =
            'Asiakkaille näkyvä sähköposti on pakollinen';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Sähköpostin muoto on virheellinen';
        }
        if (!formData.contactPhone.trim()) {
          newErrors.contactPhone =
            'Asiakkaille näkyvä puhelinnumero on pakollinen';
        } else if (!/^\+?[0-9\s\-()]{7,}$/.test(formData.contactPhone)) {
          newErrors.contactPhone = 'Puhelinnumeron muoto on virheellinen';
        }
        // Skip URL validation here since we auto-add https:// during submission
        // Just check for basic format (no spaces, reasonable length)
        if (formData.website && formData.website.trim()) {
          const cleanUrl = formData.website.trim();
          if (cleanUrl.includes(' ') || cleanUrl.length < 4) {
            newErrors.website = 'Verkkosivun osoite on virheellinen';
          }
        }

        // Validate additional URLs - basic format check only
        for (let i = 0; i < formData.additionalUrls.length; i++) {
          const url = formData.additionalUrls[i];
          if (url && url.trim()) {
            const cleanUrl = url.trim();
            if (cleanUrl.includes(' ') || cleanUrl.length < 4) {
              newErrors.additionalUrls = `Lisäverkkosivu ${
                i + 1
              } on virheellinen`;
              break;
            }
          }
        }
        break;

      case 2: // Equipment (no validation needed)
        break;

      case 3: // Images (no validation needed, images are optional)
        break;

      case 4: // Terms and review
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Käyttöehtojen hyväksyminen on pakollista';
        }
        break;
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Lisätiedot voivat olla enintään 500 merkkiä';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      // Auto-fill contact details when moving from step 0 to step 1
      if (activeStep === 0) {
        autoFillContactDetails();
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Helper function to ensure URL has protocol
      const ensureHttps = (url: string): string => {
        if (!url || url.trim() === '') return '';
        const trimmedUrl = url.trim();
        if (!/^https?:\/\//i.test(trimmedUrl)) {
          return `https://${trimmedUrl}`;
        }
        return trimmedUrl;
      };

      // Clean and validate URLs
      const cleanWebsite = ensureHttps(formData.website);
      const cleanAdditionalUrls = formData.additionalUrls
        .map((url) => ensureHttps(url))
        .filter((url) => url !== '' && url !== 'https://');

      // Prepare data for submission as FormData (to support file uploads)
      const formSubmissionData = new FormData();

      // Add text fields
      formSubmissionData.append('owner_email', formData.ownerEmail);
      formSubmissionData.append('name', formData.saunaName);
      formSubmissionData.append('location', formData.location);
      formSubmissionData.append('capacity', formData.capacity.toString());
      formSubmissionData.append(
        'event_length',
        formData.eventLength.toString()
      );
      formSubmissionData.append('price_min', formData.priceMin.toString());
      formSubmissionData.append('price_max', formData.priceMax.toString());
      formSubmissionData.append(
        'equipment',
        JSON.stringify(formData.equipment)
      );
      formSubmissionData.append('email', formData.contactEmail);
      formSubmissionData.append('phone', formData.contactPhone);
      formSubmissionData.append('url', cleanWebsite);
      formSubmissionData.append(
        'url_array',
        JSON.stringify(cleanAdditionalUrls)
      );
      formSubmissionData.append('notes', formData.notes);
      formSubmissionData.append('winter', formData.winterAvailable.toString());
      formSubmissionData.append('owner_name', formData.ownerName);
      formSubmissionData.append('owner_phone', formData.ownerPhone);

      // Add image files
      formData.images.forEach((image, index) => {
        formSubmissionData.append('images', image);
      });

      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://api.tampereensaunalautat.fi';

      const response = await fetch(`${API_BASE}/api/register/sauna`, {
        method: 'POST',
        // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
        body: formSubmissionData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Rekisteröinnin lähettämisessä tapahtui virhe'
        );
      }

      // Track successful registration
      Sentry.addBreadcrumb({
        message: 'Registration submitted successfully',
        category: 'registration',
        data: {
          name: formData.name,
          location: formData.location,
          image_count: formData.images.length,
        },
      });

      // Clear saved draft on successful submission
      clearLocalStorage();
      onSubmissionComplete();
    } catch (error) {
      console.error('Registration submission error:', error);

      // Track registration failures in Sentry with context
      Sentry.captureException(error, {
        tags: {
          section: 'registration',
          step: 'submission',
          has_images: formData.images.length > 0,
        },
        extra: {
          form_data_summary: {
            name: formData.name,
            location: formData.location,
            capacity: formData.capacity,
            image_count: formData.images.length,
            total_file_size: formData.images.reduce(
              (sum, img) => sum + img.size,
              0
            ),
          },
        },
      });

      onSubmissionError(
        error instanceof Error
          ? error.message
          : 'Rekisteröinnin lähettämisessä tapahtui virhe'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderOwnerInfoStep();
      case 1:
        return renderSaunaDetailsStep();
      case 2:
        return renderEquipmentStep();
      case 3:
        return renderImagesStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderOwnerInfoStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Omistajan yhteystiedot
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Anna yhteystietosi saunalautan omistajana. Näitä tietoja käytetään
        yhteydenpitoon rekisteröinnin käsittelyn aikana.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label='Koko nimi'
            value={formData.ownerName}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            error={!!errors.ownerName}
            helperText={errors.ownerName}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Sähköpostiosoite'
            type='email'
            value={formData.ownerEmail}
            onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
            error={!!errors.ownerEmail}
            helperText={errors.ownerEmail}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Puhelinnumero'
            value={formData.ownerPhone}
            onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
            error={!!errors.ownerPhone}
            helperText={errors.ownerPhone}
            placeholder='+358 40 123 4567'
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderSaunaDetailsStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Saunan perustiedot
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Kerro saunalautastasi. Nämä tiedot näkyvät julkisessa listauksessa.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            label='Saunan nimi'
            value={formData.saunaName}
            onChange={(e) => handleInputChange('saunaName', e.target.value)}
            error={!!errors.saunaName}
            helperText={errors.saunaName}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth required error={!!errors.location}>
            <InputLabel>Sijainti</InputLabel>
            <Select
              value={formData.location}
              label='Sijainti'
              onChange={(e) => handleInputChange('location', e.target.value)}
            >
              {LOCATION_OPTIONS.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label='Henkilömäärä'
            type='number'
            value={formData.capacity || ''}
            onChange={(e) =>
              handleInputChange('capacity', parseInt(e.target.value) || 0)
            }
            error={!!errors.capacity}
            helperText={errors.capacity}
            slotProps={{ htmlInput: { min: 1, max: 100 } }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label='Tapahtuman kesto (tuntia)'
            type='number'
            value={formData.eventLength || ''}
            onChange={(e) =>
              handleInputChange('eventLength', parseInt(e.target.value) || 0)
            }
            error={!!errors.eventLength}
            helperText={
              errors.eventLength || 'Saunaristeilyn oletuskesto, yleensä 3 h'
            }
            slotProps={{ htmlInput: { min: 1, max: 24 } }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.winterAvailable}
                onChange={(e) =>
                  handleInputChange('winterAvailable', e.target.checked)
                }
              />
            }
            label='Käytettävissä talvella'
            sx={{ mt: { xs: 1, sm: 2 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Minimihinta (€)'
            type='number'
            value={formData.priceMin || ''}
            onChange={(e) =>
              handleInputChange('priceMin', parseInt(e.target.value) || 0)
            }
            error={!!errors.priceMin}
            helperText={
              errors.priceMin ||
              'Hinta alkaen, esim. arkipäivien edullisempi hinta'
            }
            slotProps={{ htmlInput: { min: 0 } }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Maksimihinta (€)'
            type='number'
            value={formData.priceMax || ''}
            onChange={(e) =>
              handleInputChange('priceMax', parseInt(e.target.value) || 0)
            }
            error={!!errors.priceMax}
            helperText={
              errors.priceMax ||
              'Hinta enintään, esim. viikonloppuisin on usein kalliimpaa'
            }
            slotProps={{ htmlInput: { min: 0 } }}
            required
          />
        </Grid>

        {/* Contact Information */}
        <Grid size={12}>
          <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
            Asiakkaiden yhteystiedot
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Nämä yhteystiedot näkyvät asiakkaille listauksessa.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Asiakkaille näkyvä sähköposti'
            type='email'
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Asiakkaille näkyvä puhelinnumero'
            value={formData.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Verkkosivut (valinnainen)'
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            error={!!errors.website}
            helperText={errors.website}
            placeholder='example.com '
          />
        </Grid>

        {/* Additional URLs */}
        <Grid size={12}>
          <Typography variant='body2' gutterBottom sx={{ mt: 2 }}>
            Lisää verkkosivuja (valinnainen)
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mb: 2, display: 'block' }}
          >
            Esim. varauskalenteri tai Facebook-tili
          </Typography>
          {formData.additionalUrls.map((url, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Lisäverkkosivu ${index + 1}`}
              value={url}
              onChange={(e) => handleUrlArrayChange(index, e.target.value)}
              error={!!errors.additionalUrls}
              helperText={index === 0 ? errors.additionalUrls : ''}
              placeholder='example.com'
              sx={{ mb: 1 }}
            />
          ))}
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label='Lisätiedot (valinnainen)'
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            error={!!errors.notes}
            helperText={errors.notes || `${formData.notes.length}/500 merkkiä`}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderEquipmentStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Varusteet ja palvelut
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Valitse saunalauttasi varusteet. Nämä auttavat asiakkaita löytämään
        sopivan vaihtoehdon.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper variant='outlined' sx={{ p: { xs: 2, sm: 3 } }}>
        <FormGroup>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={equipment}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.equipment.includes(equipment)}
                      onChange={(e) =>
                        handleEquipmentChange(equipment, e.target.checked)
                      }
                    />
                  }
                  label={equipment}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Paper>

      <Alert severity='info' sx={{ mt: 3 }}>
        <Typography variant='body2'>
          Valitse kaikki saunalautassasi olevat varusteet. Jos jokin varuste
          puuttuu listasta, voit mainita sen lisätiedoissa edellisessä
          vaiheessa.
        </Typography>
      </Alert>
    </Box>
  );

  const renderImagesStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Kuvat saunalautasta
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Lataa kuvia saunalautastasi. Kuvat auttavat asiakkaita tekemään
        varauksen. Voit lisätä kuvia myös myöhemmin kirjautumisen jälkeen.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <RegistrationImageManager
        images={formData.images}
        mainImageIndex={formData.mainImageIndex}
        onImagesUpdate={(images, mainImageIndex) => {
          const newFormData = { ...formData, images, mainImageIndex };
          setFormData(newFormData);
          saveToLocalStorage(newFormData);
        }}
        disabled={isSubmitting}
      />
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Ehdot ja yhteenveto
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Tarkista tietosi ja hyväksy ehdot lähettääksesi rekisteröinnin.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Terms acceptance */}
      <Card variant='outlined' sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Ehdot ja säännöt
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptTerms}
              onChange={(e) =>
                handleInputChange('acceptTerms', e.target.checked)
              }
              color='primary'
            />
          }
          label={
            <Typography
              variant='body2'
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Hyväksyn{' '}
              <a
                href='/terms'
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#2c5282', textDecoration: 'underline' }}
              >
                Tampereensaunalautat.fi-palvelun käyttöehdot
              </a>{' '}
              ja annan suostumukseni yhteystietojeni käsittelyyn saunalautani
              esittelemiseksi sivustolla. Sitoudun antamaan totuudenmukaisia
              tietoja.
            </Typography>
          }
        />
        {errors.acceptTerms && (
          <Typography
            variant='caption'
            color='error'
            display='block'
            sx={{ mt: 1 }}
          >
            {errors.acceptTerms}
          </Typography>
        )}
      </Card>

      {/* Data summary */}
      <Card variant='outlined' sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant='h6' gutterBottom>
          Yhteenveto rekisteröinnistä
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Omistaja:
            </Typography>
            <Typography variant='body1'>{formData.ownerName}</Typography>
            <Typography variant='body2'>{formData.ownerEmail}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Saunalautta:
            </Typography>
            <Typography variant='body1'>{formData.saunaName}</Typography>
            <Typography variant='body2'>
              {formData.location}, {formData.capacity} henkilöä
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Hinnat:
            </Typography>
            <Typography variant='body1'>
              {formData.priceMin}€ - {formData.priceMax}€
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Varusteet:
            </Typography>
            <Typography variant='body2'>
              {formData.equipment.length > 0
                ? formData.equipment.join(', ')
                : 'Ei valittuja varusteita'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      <Alert severity='warning' sx={{ mt: 3 }}>
        <Typography variant='body2'>
          <strong>Huomio:</strong> Rekisteröintisi tarkastetaan ennen julkaisua.
          Saat sähköpostiviestin, kun rekisteröinti on hyväksytty tai hylätty.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <Box>
      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          '& .MuiStepLabel-root': {
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1 },
          },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            textAlign: 'center',
            marginTop: { xs: 0.5, sm: 0 },
          },
          '& .MuiStepConnector-root': {
            display: { xs: 'none', sm: 'block' },
          },
          '& .MuiStep-root': {
            padding: { xs: '0 4px', sm: '0 8px' },
          },
        }}
      >
        {(isMobile ? mobileSteps : steps).map((label, index) => {
          const StepIcon = stepIcons[index];
          return (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIcon
                    sx={{
                      color:
                        activeStep >= index ? 'primary.main' : 'text.secondary',
                      fontSize: { xs: 20, sm: 22, md: 24 },
                    }}
                  />
                )}
              >
                {isVerySmall ? '' : label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Current step title for very small screens */}
      {isVerySmall && (
        <Typography
          variant='h6'
          align='center'
          sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}
        >
          {activeStep + 1}/5: {mobileSteps[activeStep]}
        </Typography>
      )}

      {/* Step Content */}
      <Box
        sx={{
          minHeight: 400,
          mb: 4,
          px: { xs: 1, sm: 2, md: 0 },
          '& .MuiTextField-root': {
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
            },
          },
        }}
      >
        {renderStepContent(activeStep)}
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: 2,
          px: { xs: 1, sm: 2, md: 0 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<NavigateBeforeIcon />}
          fullWidth={isVerySmall}
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Takaisin
        </Button>

        <Box sx={{ order: { xs: 1, sm: 2 } }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={20} /> : <SendIcon />
              }
              size='large'
              fullWidth={isVerySmall}
            >
              {isSubmitting ? 'Lähetetään...' : 'Lähetä rekisteröinti'}
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleNext}
              endIcon={<NavigateNextIcon />}
              size='large'
              fullWidth={isVerySmall}
            >
              Seuraava
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationWizard;
