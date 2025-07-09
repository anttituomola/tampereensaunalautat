import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { authAPI, getImageUrl } from '../lib/api';
import { toast } from 'react-toastify';

interface ImageManagerProps {
  saunaId: string;
  images: string[];
  mainImage: string | null;
  onImagesUpdate: (images: string[], mainImage: string | null) => void;
  disabled?: boolean;
}

interface UploadProgress {
  progress: number;
  uploading: boolean;
  error: string | null;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  saunaId,
  images,
  mainImage,
  onImagesUpdate,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false,
    error: null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 15;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
  const ACCEPTED_TYPES = [
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
  ];

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
    async (files: File[]) => {
      if (disabled) return;

      console.log(
        '🚀 Starting image upload process with files:',
        files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        errors.forEach((error) => toast.error(error));
        return;
      }

      if (valid.length === 0) {
        console.log('❌ No valid files to upload');
        return;
      }

      console.log(
        '✅ Valid files for upload:',
        valid.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      setUploadProgress({ progress: 0, uploading: true, error: null });

      try {
        console.log('📤 Calling authAPI.uploadImages with saunaId:', saunaId);
        const uploadedImages = await authAPI.uploadImages(saunaId, valid);
        console.log('✅ Upload successful, received images:', uploadedImages);

        const newImages = [...images, ...uploadedImages];
        const newMainImage = mainImage || uploadedImages[0];

        onImagesUpdate(newImages, newMainImage);

        toast.success(`${uploadedImages.length} kuvaa ladattu onnistuneesti`);
      } catch (error) {
        let errorMessage = 'Virhe kuvien lataamisessa';

        if (error instanceof Error) {
          if (error.message.includes('413')) {
            errorMessage =
              'Kuvat ovat liian suuria yhteensä. Yritä ladata vähemmän kuvia kerrallaan tai pienemmpiä tiedostoja.';
          } else if (error.message.includes('400')) {
            errorMessage =
              'Virheellinen tiedostomuoto. Käytä yleisiä kuvaformaatteja.';
          } else if (error.message.includes('403')) {
            errorMessage = 'Ei oikeuksia muokata tätä saunaa.';
          } else {
            errorMessage = error.message;
          }
        }

        setUploadProgress((prev) => ({ ...prev, error: errorMessage }));
        toast.error(errorMessage);
      } finally {
        setUploadProgress({ progress: 0, uploading: false, error: null });
      }
    },
    [saunaId, images, mainImage, disabled, onImagesUpdate, validateFiles]
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
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFileUpload(files);
  };

  const handleDeleteImage = async (filename: string) => {
    if (disabled) return;

    try {
      await authAPI.deleteImage(saunaId, filename);

      const newImages = images.filter((img) => img !== filename);
      const newMainImage =
        filename === mainImage ? newImages[0] || null : mainImage;

      onImagesUpdate(newImages, newMainImage);
      toast.success('Kuva poistettu onnistuneesti');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Virhe kuvan poistamisessa';
      toast.error(errorMessage);
    }
  };

  const handleSetMainImage = async (filename: string) => {
    if (disabled || filename === mainImage) return;

    try {
      await authAPI.setMainImage(saunaId, filename);
      onImagesUpdate(images, filename);
      toast.success('Pääkuva asetettu');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Virhe pääkuvan asettamisessa';
      toast.error(errorMessage);
    }
  };

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || disabled) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      const newImages = Array.from(images);
      const [reorderedImage] = newImages.splice(sourceIndex, 1);
      newImages.splice(destinationIndex, 0, reorderedImage);

      // Optimistically update the UI
      onImagesUpdate(newImages, mainImage);
      setIsReordering(true);

      try {
        await authAPI.reorderImages(saunaId, newImages);
        toast.success('Kuvien järjestys päivitetty');
      } catch (error) {
        // Revert on error
        onImagesUpdate(images, mainImage);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Virhe kuvien järjestämisessä';
        toast.error(errorMessage);
      } finally {
        setIsReordering(false);
      }
    },
    [saunaId, images, mainImage, disabled, onImagesUpdate]
  );

  const openDeleteDialog = (filename: string) => {
    setImageToDelete(filename);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      handleDeleteImage(imageToDelete);
    }
    closeDeleteDialog();
  };

  // Image error handler for debugging CORS issues
  const handleImageError = (filename: string, error: any) => {
    console.error('❌ Image load error for:', filename, error);
    console.log('🔍 Debugging info:', {
      filename,
      imageUrl: getImageUrl(filename),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Try to reload the image after a delay
    setTimeout(() => {
      console.log('🔄 Attempting to reload image:', filename);
      const img = document.querySelector(
        `img[src*="${filename}"]`
      ) as HTMLImageElement;
      if (img) {
        // Force reload by adding timestamp
        const newSrc = `${getImageUrl(filename)}?t=${Date.now()}`;
        console.log('🔗 Reloading with cache-busting URL:', newSrc);
        img.src = newSrc;
      }
    }, 2000);
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Kuvien hallinta
      </Typography>

      <Typography variant='body2' color='text.secondary' gutterBottom>
        Maksimi {MAX_IMAGES} kuvaa. Vedä ja pudota kuvia
        uudelleenjärjestämiseen.
      </Typography>

      {/* Debug tools for CORS issues */}
      {process.env.NODE_ENV === 'development' && images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant='outlined'
            size='small'
            onClick={() => {
              console.log('🔄 Force refreshing all images...');
              images.forEach((image) => {
                const img = document.querySelector(
                  `img[src*="${image}"]`
                ) as HTMLImageElement;
                if (img) {
                  const newSrc = `${getImageUrl(image)}?t=${Date.now()}`;
                  console.log('🔗 Refreshing:', newSrc);
                  img.src = newSrc;
                }
              });
            }}
          >
            🔄 Päivitä kuvat (Debug)
          </Button>
        </Box>
      )}

      {/* Upload Area */}
      <Box
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          mb: 3,
          textAlign: 'center',
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CloudUploadIcon
          sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
        />
        <Typography variant='h6' gutterBottom>
          Vedä kuvia tähän tai klikkaa valitaksesi
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Tuetut tiedostotyypit: JPG, PNG, WebP, AVIF, HEIC, TIFF, BMP, GIF
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Maksimi tiedostokoko: 5MB per kuva
        </Typography>

        {images.length > 0 && (
          <Chip
            label={`${images.length}/${MAX_IMAGES} kuvaa`}
            color={images.length >= MAX_IMAGES ? 'error' : 'primary'}
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*'
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {/* Upload Progress */}
      {uploadProgress.uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant='body2' sx={{ mt: 1 }}>
            Ladataan kuvia...
          </Typography>
        </Box>
      )}

      {uploadProgress.error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {uploadProgress.error}
        </Alert>
      )}

      {/* Images Grid with Drag and Drop */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='images-grid' direction='horizontal'>
            {(provided, snapshot) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 2,
                  backgroundColor: snapshot.isDraggingOver
                    ? 'action.hover'
                    : 'transparent',
                  transition: 'background-color 0.2s ease',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {isReordering && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1000,
                      borderRadius: 1,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                {images.map((image, index) => (
                  <Draggable
                    key={image}
                    draggableId={`image-${index}-${image}`}
                    index={index}
                    isDragDisabled={disabled || isReordering}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          position: 'relative',
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          transform: snapshot.isDragging
                            ? 'rotate(5deg)'
                            : 'none',
                          transition: snapshot.isDragging
                            ? 'none'
                            : 'all 0.2s ease',
                          cursor:
                            disabled || isReordering
                              ? 'not-allowed'
                              : 'default',
                          zIndex: snapshot.isDragging ? 1001 : 'auto',
                        }}
                      >
                        <CardMedia
                          component='img'
                          height='200'
                          image={getImageUrl(image)}
                          alt={`Kuva ${index + 1}`}
                          sx={{
                            objectFit: 'cover',
                            backgroundColor: 'grey.100',
                          }}
                          onError={(e) => handleImageError(image, e)}
                          loading='lazy'
                        />

                        {/* Main Image Indicator */}
                        {image === mainImage && (
                          <Chip
                            icon={<StarIcon />}
                            label='Pääkuva'
                            color='primary'
                            size='small'
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 2,
                            }}
                          />
                        )}

                        {/* Drag Handle */}
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: 1,
                            p: 0.5,
                            cursor:
                              disabled || isReordering ? 'not-allowed' : 'grab',
                            opacity: disabled || isReordering ? 0.5 : 1,
                            zIndex: 2,
                            '&:active': {
                              cursor: 'grabbing',
                            },
                          }}
                        >
                          <DragIndicatorIcon
                            sx={{ color: 'white', fontSize: 20 }}
                          />
                        </Box>

                        <CardActions>
                          <Tooltip
                            title={
                              image === mainImage
                                ? 'Tämä on pääkuva'
                                : 'Aseta pääkuvaksi'
                            }
                          >
                            <IconButton
                              onClick={() => handleSetMainImage(image)}
                              disabled={
                                disabled || image === mainImage || isReordering
                              }
                              color={
                                image === mainImage ? 'primary' : 'default'
                              }
                            >
                              {image === mainImage ? (
                                <StarIcon />
                              ) : (
                                <StarBorderIcon />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Poista kuva'>
                            <IconButton
                              onClick={() => openDeleteDialog(image)}
                              disabled={disabled || isReordering}
                              color='error'
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Vahvista kuvan poisto</DialogTitle>
        <DialogContent>
          <Typography>
            Haluatko varmasti poistaa tämän kuvan? Tätä toimintoa ei voi
            peruuttaa.
          </Typography>
          {imageToDelete === mainImage && (
            <Alert severity='warning' sx={{ mt: 2 }}>
              Tämä on pääkuva. Seuraava kuva järjestyksessä asetetaan uudeksi
              pääkuvaksi.
            </Alert>
          )}
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

export default ImageManager;
