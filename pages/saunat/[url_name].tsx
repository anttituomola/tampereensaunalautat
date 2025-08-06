import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import styles from 'styles/url_name.module.css';
import Head from 'next/head';
import { Saunalautta } from 'types';
import { fetchSaunas, getImageUrl } from 'lib/api';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  ImageList,
  ImageListItem,
  Modal,
  Box,
  Paper,
  Typography,
  Container,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
} from '@mui/material';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WcIcon from '@mui/icons-material/Wc';
import ShowerIcon from '@mui/icons-material/Shower';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DeckIcon from '@mui/icons-material/Deck';
import HotTubIcon from '@mui/icons-material/HotTub';
import KitchenIcon from '@mui/icons-material/Kitchen';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import TvIcon from '@mui/icons-material/Tv';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicrowaveIcon from '@mui/icons-material/Microwave';
import CoffeeIcon from '@mui/icons-material/Coffee';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import EuroIcon from '@mui/icons-material/Euro';
import FireplaceIcon from '@mui/icons-material/Fireplace';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

interface Props {
  sauna?: Saunalautta;
}

const getEquipmentIcon = (equipment: string) => {
  switch (equipment.toLowerCase()) {
    case 'takka':
      return <FireplaceIcon />;
    case 'jääpalakone':
      return <LocalBarIcon />;
    case 'wc':
      return <WcIcon />;
    case 'suihku':
      return <ShowerIcon />;
    case 'pukuhuone':
      return <CheckroomIcon />;
    case 'kattoterassi':
      return <DeckIcon />;
    case 'palju':
    case 'poreallas':
      return <HotTubIcon />;
    case 'kylmäsäilytys':
    case 'jääkaappi':
      return <KitchenIcon />;
    case 'grilli':
    case 'kaasugrilli':
      return <OutdoorGrillIcon />;
    case 'puulämmitteinen kiuas':
      return <FireplaceIcon />;
    case 'tv':
      return <TvIcon />;
    case 'äänentoisto':
      return <VolumeUpIcon />;
    case 'mikro':
    case 'mikroaaltouuni':
      return <MicrowaveIcon />;
    case 'kahvinkeitin':
      return <CoffeeIcon />;
    case 'ilmastointi':
      return <AcUnitIcon />;
    default:
      return null;
  }
};

const LauttaPage: NextPage<Props> = ({ sauna }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [columns, setColumns] = useState(3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saunasOnState, setSaunasOnState] = useState<Saunalautta[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setColumns(window.innerWidth <= 600 ? 2 : 3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newIndex =
        (currentImageIndex - 1 + sauna!.images.length) % sauna!.images.length;
      setCurrentImageIndex(newIndex);
      setModalImage(sauna!.images[newIndex]);
    },
    [currentImageIndex, sauna]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newIndex = (currentImageIndex + 1) % sauna!.images.length;
      setCurrentImageIndex(newIndex);
      setModalImage(sauna!.images[newIndex]);
    },
    [currentImageIndex, sauna]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'ArrowLeft') {
          handlePrevImage(e as unknown as React.MouseEvent);
        } else if (e.key === 'ArrowRight') {
          handleNextImage(e as unknown as React.MouseEvent);
        } else if (e.key === 'Escape') {
          handleClose();
        }
      }
    },
    [open, handlePrevImage, handleNextImage, handleClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get initial saunasOnState from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSaunas = localStorage.getItem('saunasOnState');
      if (storedSaunas) {
        setSaunasOnState(JSON.parse(storedSaunas));
      }
      setIsInitialized(true);
    }
  }, []);

  const addSaunaToState = (sauna: Saunalautta) => {
    if (saunasOnState.find((s) => s.id === sauna.id)) {
      return;
    }
    const newSaunasOnState = [...saunasOnState, sauna];
    setSaunasOnState(newSaunasOnState);
    if (isInitialized) {
      localStorage.setItem('saunasOnState', JSON.stringify(newSaunasOnState));
    }
    toast.success(
      `${sauna.name} lisätty tarjouspyyntöön, lomake etusivun ylälaidassa`
    );
    router.push('/');
  };

  // Check if this sauna is already in RFP
  const isSaunaInRfp = sauna
    ? saunasOnState.some((s) => s.id === sauna.id)
    : false;

  if (!sauna) {
    return (
      <Container maxWidth='lg' className={styles.container}>
        <div className={styles.loadingContainer}>
          <CircularProgress />
          <Typography>Loading sauna information...</Typography>
        </div>
      </Container>
    );
  }
  const pageTitle = `Saunalautta Tampere: ${sauna.name}, ${sauna.location}`;
  const pricing =
    sauna.pricemin === sauna.pricemax
      ? sauna.pricemin
      : `${sauna.pricemin} - ${sauna.pricemax}`;

  const handleOpen = (image: string) => {
    const index = sauna.images.indexOf(image);
    setCurrentImageIndex(index);
    setModalImage(image);
    setOpen(true);
  };

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name='description'
          content={`${sauna.name} sijainti on ${sauna.location} ja vuokrahinta on alkaen ${sauna.pricemin}`}
        />
      </Head>

      <Paper elevation={0} className={styles.mainContent}>
        <Typography variant='h1' className={styles.title}>
          {sauna.name}
        </Typography>

        <div className={styles.mainImageHolder}>
          {sauna.mainImage ? (
            <Image
              src={getImageUrl(sauna.mainImage)}
              alt={sauna.name}
              className={styles.mainImage}
              fill={true}
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className={styles.placeholderImage}>
              <Typography>Ei kuvaa saatavilla</Typography>
            </div>
          )}
        </div>

        {!isSaunaInRfp && (
          <div className={styles.rfpButtonContainer}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddIcon />}
              onClick={() => addSaunaToState(sauna)}
              sx={{ mt: 2, mb: 2 }}
              fullWidth
              data-cy={`addButton-detail-${sauna.name}`}
            >
              Lisää tarjouspyyntöön
            </Button>
          </div>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <section className={styles.section}>
              <Typography variant='h2' className={styles.sectionTitle}>
                Perustiedot
              </Typography>
              <List>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText primary={sauna.location} />
                </ListItem>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <GroupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${sauna.capacity} henkilöä`}
                    secondary={`${sauna.name} pystyy ${
                      sauna.name === 'Saunalautta (Tampereen vesijettivuokraus)'
                        ? 'saunottamaan'
                        : 'kuljettamaan risteilyllä'
                    } maksimissaan ${sauna.capacity} henkilöä.`}
                  />
                </ListItem>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <EuroIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${pricing} € / ${sauna.eventLength}h`}
                    secondary={`Vuonna ${dayjs().format('YYYY')} tyypillinen ${
                      sauna.eventLength
                    } tunnin ${
                      sauna.name === 'Saunalautta (Tampereen vesijettivuokraus)'
                        ? 'sauna'
                        : 'risteily'
                    } saunalautalla ${sauna.name} maksaa noin ${pricing} €. ${
                      sauna.notes || ''
                    }`}
                  />
                </ListItem>
              </List>
            </section>

            <section className={styles.section}>
              <Typography variant='h2' className={styles.sectionTitle}>
                Yhteystiedot
              </Typography>
              <List>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <LocalPhoneIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <a href={`tel:${sauna.phone}`}>{sauna.phone}</a>
                  </ListItemText>
                </ListItem>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <a href={`mailto:${sauna.email}`}>{sauna.email}</a>
                  </ListItemText>
                </ListItem>
                {sauna.url && (
                  <ListItem className={styles.contactItem}>
                    <ListItemIcon>
                      <LinkIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <a
                        href={sauna.url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {sauna.url.length > 50
                          ? sauna.url.slice(0, 50) + '...'
                          : sauna.url}
                      </a>
                    </ListItemText>
                  </ListItem>
                )}
                {sauna.urlArray.map((url) => (
                  <ListItem key={url} className={styles.contactItem}>
                    <ListItemIcon>
                      <LinkIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <a href={url} target='_blank' rel='noopener noreferrer'>
                        {url.length > 50 ? url.slice(0, 50) + '...' : url}
                      </a>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </section>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <section className={styles.section}>
              <Typography variant='h2' className={styles.sectionTitle}>
                Varusteet
              </Typography>
              <List>
                {sauna.equipment.sort().map((item) => {
                  const icon = getEquipmentIcon(item);
                  if (!item) return null;
                  return (
                    <ListItem key={item} className={styles.equipmentItem}>
                      {icon && <ListItemIcon>{icon}</ListItemIcon>}
                      <ListItemText primary={item} />
                    </ListItem>
                  );
                })}
              </List>
            </section>
          </Grid>
        </Grid>

        {sauna.images.length > 0 && (
          <section className={styles.section}>
            <Typography variant='h2' className={styles.sectionTitle}>
              Kuvia
            </Typography>
            <div style={{ overflow: 'hidden' }}>
              <ImageList
                cols={columns}
                gap={8}
                rowHeight={200}
                sx={{
                  gridAutoFlow: 'dense',
                  '& .MuiImageListItem-root': {
                    overflow: 'hidden',
                    borderRadius: 1,
                  },
                }}
              >
                {sauna.images.map((image) => (
                  <ImageListItem
                    key={image}
                    className={styles.galleryItem}
                    onClick={() => handleOpen(image)}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={sauna.name}
                      loading='lazy'
                      className={styles.galleryImage}
                      width={0}
                      height={0}
                      sizes='100vw'
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </div>
          </section>
        )}
      </Paper>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='image-modal'
        className={styles.modal}
      >
        <Box className={styles.modalContent} onClick={handleClose}>
          <IconButton
            onClick={handleClose}
            className={styles.closeButton}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>

          {sauna.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                className={`${styles.navButton} ${styles.prevButton}`}
                aria-label='previous image'
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                className={`${styles.navButton} ${styles.nextButton}`}
                aria-label='next image'
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}

          <div
            className={styles.modalImageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(modalImage)}
              alt={sauna.name}
              className={styles.modalImage}
              fill={true}
              sizes='100vw'
            />
          </div>

          <Typography className={styles.imageCounter}>
            {sauna.images.length > 1 &&
              `${currentImageIndex + 1} / ${sauna.images.length}`}
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default LauttaPage;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const saunas = await fetchSaunas();
    const paths = saunas.map((sauna) => ({
      params: {
        url_name: sauna.url_name,
      },
    }));

    return {
      paths,
      fallback: 'blocking', // Enable ISR for new saunas
    };
  } catch (error) {
    console.error('Error fetching saunas for paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;

  if (!params || !params.url_name) {
    return {
      notFound: true,
    };
  }

  try {
    const saunas = await fetchSaunas();
    const sauna = saunas.find((sauna) => sauna.url_name === params.url_name);

    if (!sauna) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        sauna,
      },
      // Revalidate every hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching sauna:', error);
    return {
      notFound: true,
    };
  }
};
