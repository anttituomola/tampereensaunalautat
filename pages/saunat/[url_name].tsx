import { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "styles/[url_name].module.css";
import Head from "next/head";
import { Saunalautta } from "types";
import { saunas } from "saunadata";
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
} from "@mui/material";
import { NextPage } from "next";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WcIcon from "@mui/icons-material/Wc";
import ShowerIcon from "@mui/icons-material/Shower";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import DeckIcon from "@mui/icons-material/Deck";
import HotTubIcon from "@mui/icons-material/HotTub";
import KitchenIcon from "@mui/icons-material/Kitchen";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import TvIcon from "@mui/icons-material/Tv";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MicrowaveIcon from "@mui/icons-material/Microwave";
import CoffeeIcon from "@mui/icons-material/Coffee";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import EuroIcon from "@mui/icons-material/Euro";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import LocalBarIcon from "@mui/icons-material/LocalBar";

interface Props {
  sauna: Saunalautta;
}

const getEquipmentIcon = (equipment: string) => {
  switch (equipment.toLowerCase()) {
    case "takka":
      return <FireplaceIcon />;
    case "jääpalakone":
      return <LocalBarIcon />;
    case "wc":
      return <WcIcon />;
    case "suihku":
      return <ShowerIcon />;
    case "pukuhuone":
      return <CheckroomIcon />;
    case "kattoterassi":
      return <DeckIcon />;
    case "palju":
    case "poreallas":
      return <HotTubIcon />;
    case "kylmäsäilytys":
    case "jääkaappi":
      return <KitchenIcon />;
    case "grilli":
      return <OutdoorGrillIcon />;
    case "tv":
      return <TvIcon />;
    case "äänentoisto":
      return <VolumeUpIcon />;
    case "mikro":
    case "mikroaaltouuni":
      return <MicrowaveIcon />;
    case "kahvinkeitin":
      return <CoffeeIcon />;
    case "ilmastointi":
      return <AcUnitIcon />;
    default:
      return null;
  }
};

const LauttaPage: NextPage<Props> = ({ sauna }) => {
  const [open, setOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [columns, setColumns] = useState(3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const pageTitle = `Saunalautta Tampere: ${sauna.name}, ${sauna.location}`;
  const pricing =
    sauna.pricemin === sauna.pricemax
      ? sauna.pricemin
      : `${sauna.pricemin} - ${sauna.pricemax}`;

  useEffect(() => {
    const handleResize = () => {
      setColumns(window.innerWidth <= 600 ? 2 : 3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    const newIndex =
      (currentImageIndex - 1 + sauna.images.length) % sauna.images.length;
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
      if (e.key === "ArrowLeft") {
        handlePrevImage(e as unknown as React.MouseEvent);
      } else if (e.key === "ArrowRight") {
        handleNextImage(e as unknown as React.MouseEvent);
      } else if (e.key === "Escape") {
        handleClose();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentImageIndex]);

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`${sauna.name} sijainti on ${sauna.location} ja vuokrahinta on alkaen ${sauna.pricemin}`}
        />
      </Head>

      <Paper elevation={0} className={styles.mainContent}>
        <Typography variant="h1" className={styles.title}>
          {sauna.name}
        </Typography>

        <div className={styles.mainImageHolder}>
          <img
            src={`/images/${sauna.mainImage}`}
            alt={sauna.name}
            className={styles.mainImage}
          />
        </div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <section className={styles.section}>
              <Typography variant="h2" className={styles.sectionTitle}>
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
                      sauna.name === "Saunalautta (Tampereen vesijettivuokraus)"
                        ? "saunottamaan"
                        : "kuljettamaan risteilyllä"
                    } maksimissaan ${sauna.capacity} henkilöä.`}
                  />
                </ListItem>
                <ListItem className={styles.contactItem}>
                  <ListItemIcon>
                    <EuroIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${pricing} € / ${sauna.eventLength}h`}
                    secondary={`Vuonna ${dayjs().format("YYYY")} tyypillinen ${
                      sauna.eventLength
                    } tunnin ${
                      sauna.name === "Saunalautta (Tampereen vesijettivuokraus)"
                        ? "sauna"
                        : "risteily"
                    } saunalautalla ${sauna.name} maksaa noin ${pricing} €. ${
                      sauna.notes || ""
                    }`}
                  />
                </ListItem>
              </List>
            </section>

            <section className={styles.section}>
              <Typography variant="h2" className={styles.sectionTitle}>
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
                {sauna.urlArray.map((url) => (
                  <ListItem key={url} className={styles.contactItem}>
                    <ListItemIcon>
                      <LinkIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url.length > 50 ? url.slice(0, 50) + "..." : url}
                      </a>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </section>
          </Grid>

          <Grid item xs={12} md={6}>
            <section className={styles.section}>
              <Typography variant="h2" className={styles.sectionTitle}>
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
            <Typography variant="h2" className={styles.sectionTitle}>
              Kuvia
            </Typography>
            <ImageList
              cols={columns}
              gap={8}
              sx={{
                gridAutoFlow: "dense",
                "& .MuiImageListItem-root": {
                  overflow: "hidden",
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
            {sauna.images.length > 1 &&
              `${currentImageIndex + 1} / ${sauna.images.length}`}
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
