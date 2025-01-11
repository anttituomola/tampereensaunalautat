import { useState, useEffect } from 'react';
import dayjs from "dayjs";
import styles from "styles/[url_name].module.css";
import Head from "next/head";
import { Saunalautta } from "types";
import { saunas } from "saunadata";
import { ImageList, ImageListItem, Modal, Box, Paper, Typography, Container, IconButton } from "@mui/material";
import { NextPage } from "next";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface Props {
  sauna: Saunalautta;
}

const LauttaPage: NextPage<Props> = ({ sauna }) => {
  const [open, setOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [columns, setColumns] = useState(3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setColumns(window.innerWidth <= 600 ? 2 : 3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpen = (image: string) => {
    const index = sauna.images.indexOf(image);
    setCurrentImageIndex(index);
    setModalImage(image);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = (currentImageIndex - 1 + sauna.images.length) % sauna.images.length;
    setCurrentImageIndex(newIndex);
    setModalImage(sauna.images[newIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = (currentImageIndex + 1) % sauna.images.length;
    setCurrentImageIndex(newIndex);
    setModalImage(sauna.images[newIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (open) {
      if (e.key === 'ArrowLeft') {
        handlePrevImage(e as unknown as React.MouseEvent);
      } else if (e.key === 'ArrowRight') {
        handleNextImage(e as unknown as React.MouseEvent);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentImageIndex]);

  const pricing = sauna.pricemin === sauna.pricemax
    ? sauna.pricemin
    : `${sauna.pricemin} - ${sauna.pricemax}`;

  const title = `Saunalautta Tampere: ${sauna.name}, ${sauna.location}`;

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`${sauna.name} sijainti on ${sauna.location} ja vuokrahinta on alkaen ${sauna.pricemin}`}
        />
      </Head>

      <Paper elevation={0} className={styles.mainContent}>
        <Typography variant="h1" className={styles.title}>
          Saunalautta Tampere: {sauna.name}
        </Typography>

        <div className={styles.mainImageHolder}>
          <img
            src={`/images/${sauna.mainImage}`}
            alt={sauna.name}
            className={styles.mainImage}
          />
        </div>

        <Typography variant="h3" className={styles.location}>
          {sauna.location}
        </Typography>

        <Typography variant="body1" className={styles.capacity}>
          {sauna.name} pystyy{" "}
          {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)"
            ? "saunottamaan"
            : "kuljettamaan risteilyllä"}{" "}
          maksimissaan {sauna.capacity} henkilöä.
        </Typography>

        <section className={styles.section}>
          <Typography variant="h2" className={styles.sectionTitle}>
            Hinnoittelu
          </Typography>
          <Typography variant="body1">
            Vuonna {dayjs().format("YYYY")} tyypillinen{" "}
            <strong>
              {sauna.eventLength} tunnin{" "}
              {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)"
                ? "sauna"
                : "risteily"}
            </strong>{" "}
            saunalautalla {sauna.name} maksaa <strong>noin {pricing} €</strong>.{" "}
            {sauna.notes}
          </Typography>
        </section>

        <section className={styles.section}>
          <Typography variant="h2" className={styles.sectionTitle}>
            Yhteystiedot
          </Typography>
          <ul className={styles.contactList}>
            {sauna.urlArray.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url.length > 50 ? url.slice(0, 50) + "..." : url}
                </a>
              </li>
            ))}
            <li>
              Puhelinnumero: <a href={`tel:${sauna.phone}`}>{sauna.phone}</a>
            </li>
            <li>
              Sähköposti: <a href={`mailto:${sauna.email}`}>{sauna.email}</a>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <Typography variant="h2" className={styles.sectionTitle}>
            Varusteet
          </Typography>
          <ul className={styles.equipmentList}>
            {sauna.equipment.sort().map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {sauna.images.length > 0 && (
          <section className={styles.section}>
            <Typography variant="h2" className={styles.sectionTitle}>
              Kuvia
            </Typography>
            <ImageList 
              cols={columns}
              gap={8}
              sx={{
                gridAutoFlow: 'dense',
                '& .MuiImageListItem-root': {
                  overflow: 'hidden',
                  borderRadius: 1
                }
              }}
            >
              {sauna.images.map((image) => (
                <ImageListItem
                  key={image}
                  className={styles.galleryItem}
                  onClick={() => handleOpen(image)}
                >
                  <img
                    src={`/images/${image}`}
                    alt={sauna.name}
                    loading="lazy"
                    className={styles.galleryImage}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </section>
        )}
      </Paper>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="image-modal"
        className={styles.modal}
      >
        <Box className={styles.modalContent}>
          <IconButton 
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>

          {sauna.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                className={`${styles.navButton} ${styles.prevButton}`}
                aria-label="previous image"
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                className={`${styles.navButton} ${styles.nextButton}`}
                aria-label="next image"
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}

          <div className={styles.modalImageWrapper}>
            <img
              src={`/images/${modalImage}`}
              alt={sauna.name}
              className={styles.modalImage}
            />
          </div>

          <Typography className={styles.imageCounter}>
            {sauna.images.length > 1 && `${currentImageIndex + 1} / ${sauna.images.length}`}
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default LauttaPage;

export const getStaticPaths = async () => {
  const paths = saunas.map((sauna) => ({
    params: {
      url_name: sauna.url_name,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context: any) => {
  const sauna = saunas.find(
    (sauna) => sauna.url_name === context.params.url_name
  );

  return {
    props: {
      sauna,
    },
  };
};