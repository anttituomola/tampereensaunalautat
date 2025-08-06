import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

interface RegistrationImageManagerProps {
  images: File[];
  mainImageIndex: number | null;
  onImagesUpdate: (images: File[], mainImageIndex: number | null) => void;
  disabled?: boolean;
}

const RegistrationImageManager: React.FC<RegistrationImageManagerProps> = ({
  images,
  mainImageIndex,
  onImagesUpdate,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 15;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

  const ACCEPTED_TYPES = useMemo(
    () => [
      'image/jpeg',
      'image/jpg',
      'image/jfif',
      'image/png',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif',
      'image/tiff',
      'image/tif',
      'image/bmp',
      'image/gif',
    ],
    []
  );

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      if (images.length + files.length > MAX_IMAGES) {
        errors.push(
          `Maksimi ${MAX_IMAGES} kuvaa sallittu. Sinulla on jo ${images.length} kuvaa.`
        );
        return { valid, errors };
      }

      files.forEach((file, index) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push(
            `Tiedosto ${
              index + 1
            }: Ei tuettu tiedostotyyppi. Käytä yleisiä kuvaformaatteja.`
          );
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            `Tiedosto ${index + 1}: Tiedosto on liian suuri (max 5MB)`
          );
          return;
        }

        valid.push(file);
      });

      return { valid, errors };
    },
    [images, ACCEPTED_TYPES, MAX_FILE_SIZE]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (disabled) return;

      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        errors.forEach((error) => console.error(error));
        return;
      }

      if (valid.length === 0) {
        return;
      }

      const newImages = [...images, ...valid];
      const newMainImageIndex = mainImageIndex !== null ? mainImageIndex : 0;

      onImagesUpdate(newImages, newMainImageIndex);
    },
    [images, mainImageIndex, disabled, onImagesUpdate, validateFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);

    // Reset the input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    let newMainImageIndex = mainImageIndex;

    // Adjust main image index if needed
    if (mainImageIndex === index) {
      newMainImageIndex = newImages.length > 0 ? 0 : null;
    } else if (mainImageIndex !== null && mainImageIndex > index) {
      newMainImageIndex = mainImageIndex - 1;
    }

    onImagesUpdate(newImages, newMainImageIndex);
  };

  const handleSetMainImage = (index: number) => {
    onImagesUpdate(images, index);
  };

  const openDeleteDialog = (index: number) => {
    setImageToDelete(index);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const confirmDelete = () => {
    if (imageToDelete !== null) {
      handleDeleteImage(imageToDelete);
    }
    closeDeleteDialog();
  };

  const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  return (
    <Box>
      {/* Upload Area */}
      <Card
        sx={{
          border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragOver ? '#f3f4f6' : '#fafafa',
          cursor: disabled ? 'not-allowed' : 'pointer',
          mb: 3,
          opacity: disabled ? 0.6 : 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            minHeight: 200,
          }}
        >
          <CloudUploadIcon
            sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant='h6' gutterBottom>
            Lisää kuvia saunalautastasi
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Raahaa kuvia tähän tai klikkaa valitaksesi tiedostoja
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
            Maksimi {MAX_IMAGES} kuvaa, enintään 5MB per kuva
          </Typography>

          <Button
            variant='outlined'
            startIcon={<PhotoCameraIcon />}
            sx={{ mt: 2 }}
            disabled={disabled}
          >
            Valitse kuvia
          </Button>
        </Box>
      </Card>

      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <Box>
          <Typography variant='h6' gutterBottom>
            Ladatut kuvat ({images.length}/{MAX_IMAGES})
          </Typography>

          <Grid container spacing={2}>
            {images.map((file, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ position: 'relative' }}>
                  <CardMedia
                    component='img'
                    height='200'
                    image={createImagePreview(file)}
                    alt={`Kuva ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />

                  {/* Main image indicator */}
                  {mainImageIndex === index && (
                    <Chip
                      label='Pääkuva'
                      color='primary'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Action buttons */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    <Tooltip
                      title={
                        mainImageIndex === index
                          ? 'Pääkuva'
                          : 'Aseta pääkuvaksi'
                      }
                    >
                      <IconButton
                        size='small'
                        onClick={() => handleSetMainImage(index)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                        }}
                        disabled={disabled}
                      >
                        {mainImageIndex === index ? (
                          <StarIcon color='primary' />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title='Poista kuva'>
                      <IconButton
                        size='small'
                        onClick={() => openDeleteDialog(index)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                        }}
                        disabled={disabled}
                      >
                        <DeleteIcon color='error' />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* File info */}
                  <Box sx={{ p: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      {file.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      display='block'
                    >
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Info alert */}
      <Alert severity='info' sx={{ mt: 3 }}>
        <Typography variant='body2'>
          <strong>Vinkkejä kuvaukseen:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Ota kuvia saunasta sekä sisältä että ulkoa</li>
          <li>Näytä mahdolliset lisävarusteet (palju, terassi, jne.)</li>
          <li>Käytä hyvää valaistusta</li>
          <li>
            Ensimmäinen kuva tai pääkuvaksi valittu kuva näkyy listauksessa
          </li>
        </ul>
      </Alert>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Poista kuva</DialogTitle>
        <DialogContent>
          <Typography>
            Haluatko varmasti poistaa tämän kuvan? Toimintoa ei voi peruuttaa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Peruuta</Button>
          <Button onClick={confirmDelete} color='error' variant='contained'>
            Poista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrationImageManager;
