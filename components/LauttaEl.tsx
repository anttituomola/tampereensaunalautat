import styles from '/styles/LauttaEl.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Saunalautta } from 'types';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../lib/api';

type Props = {
  sauna: Saunalautta;
  setSaunasOnState: React.Dispatch<React.SetStateAction<Saunalautta[]>>;
  saunasOnState: Saunalautta[];
};

const LauttaEl = ({ sauna, setSaunasOnState, saunasOnState }: Props) => {
  const isSaunaOnState = saunasOnState.some((s) => s.id === sauna.id);
  const [isHovering, setIsHovering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Initialize allImages with mainImage to prevent undefined on first render
  const [allImages, setAllImages] = useState<string[]>([sauna.mainImage]);
  const [isMobile, setIsMobile] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const imageHolderRef = useRef<HTMLDivElement>(null);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize images array with mainImage and all other images
  useEffect(() => {
    // Ensure mainImage is first and remove duplicates
    const uniqueImages = [sauna.mainImage];
    sauna.images.forEach((img) => {
      if (img !== sauna.mainImage && !uniqueImages.includes(img)) {
        uniqueImages.push(img);
      }
    });
    setAllImages(uniqueImages);

    // Preload the main image immediately
    preloadImage(sauna.mainImage);
  }, [sauna]);

  // Preload adjacent images when user interacts with carousel
  useEffect(() => {
    if (allImages.length <= 1 || (!isHovering && !isMobile)) return;

    // Preload current image and adjacent images
    const imagesToPreload = [
      allImages[currentImageIndex],
      allImages[(currentImageIndex + 1) % allImages.length],
      allImages[(currentImageIndex - 1 + allImages.length) % allImages.length],
    ];

    imagesToPreload.forEach(preloadImage);
  }, [currentImageIndex, isHovering, isMobile, allImages]);

  // Helper function to preload an image
  const preloadImage = (imageSrc: string) => {
    if (preloadedImages.has(imageSrc)) return;

    const img = new (window.Image as any)();
    img.src = getImageUrl(imageSrc);
    img.onload = () => {
      setPreloadedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(imageSrc);
        return newSet;
      });
    };
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const addSaunaToState = (sauna: Saunalautta) => {
    if (saunasOnState.find((s) => s.id === sauna.id)) {
      return;
    }
    setSaunasOnState([...saunasOnState, sauna]);
    toast.success(
      `${sauna.name} lisätty tarjouspyyntöön, lomake sivun ylälaidassa`
    );
  };

  const removeSaunaFromState = (e: React.MouseEvent, sauna: Saunalautta) => {
    e.preventDefault();
    e.stopPropagation();

    const newSaunasOnState = saunasOnState.filter((s) => s.id !== sauna.id);
    setSaunasOnState(newSaunasOnState);
    toast.success(`${sauna.name} poistettu tarjouspyynnöstä`);
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    // Only stop propagation if we're clicking on a navigation element
    if ((e.target as HTMLElement).closest(`.${styles.navButton}`)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const navigateToSaunaPage = () => {
    // For accessibility, provide a way to navigate to sauna page
    window.location.href = `/saunat/${sauna.url_name}`;
  };

  // When image container is first interacted with, preload all images
  const handleFirstInteraction = () => {
    if (allImages.length > 1) {
      allImages.forEach(preloadImage);
    }
  };

  return (
    <div className={styles.lauttaEl}>
      <div className={styles.content}>
        <div>
          <div
            className={styles.imageHolder}
            ref={imageHolderRef}
            onMouseEnter={() => {
              setIsHovering(true);
              handleFirstInteraction();
            }}
            onMouseLeave={() => {
              setIsHovering(false);
              // Don't reset image index when mouse leaves on mobile
              if (!isMobile) {
                setCurrentImageIndex(0);
              }
            }}
            onClick={navigateToSaunaPage}
          >
            <Image
              className={styles.theImage}
              src={getImageUrl(allImages[currentImageIndex])}
              alt={sauna.name}
              fill={true}
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              priority={currentImageIndex === 0} // Only prioritize loading the main image
            />

            {/* Preload hidden images for smoother carousel */}
            <div className={styles.hiddenPreload}>
              {allImages.length > 1 &&
                allImages.map(
                  (img, index) =>
                    index !== currentImageIndex && (
                      <link
                        key={img}
                        rel='preload'
                        href={getImageUrl(img)}
                        as='image'
                      />
                    )
                )}
            </div>

            {/* Always show indicator if multiple images exist */}
            {allImages.length > 1 && (
              <>
                <div className={styles.imageCountIndicator}>
                  {currentImageIndex + 1}/{allImages.length}
                </div>
                {!isMobile && (
                  <div className={styles.scrollHintOverlay}>
                    <div className={styles.scrollHintIcon}></div>
                  </div>
                )}
              </>
            )}

            {/* Show carousel controls based on device type and hover state */}
            {(isMobile || isHovering) && allImages.length > 1 && (
              <div
                className={`${styles.carouselContainer} ${
                  isMobile ? styles.mobileBtns : ''
                }`}
                onClick={handleCarouselClick}
              >
                <div className={styles.carouselNavigation}>
                  <IconButton
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={handlePrevImage}
                    size='small'
                    aria-label='Previous image'
                  >
                    <ArrowBackIosNewIcon fontSize='small' />
                  </IconButton>

                  <IconButton
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={handleNextImage}
                    size='small'
                    aria-label='Next image'
                  >
                    <ArrowForwardIosIcon fontSize='small' />
                  </IconButton>
                </div>

                <div className={styles.carouselIndicator}>
                  {allImages.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.indicatorDot} ${
                        index === currentImageIndex ? styles.activeDot : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <h2 className={styles.title}>
            <Link href={`/saunat/${sauna.url_name}`}>{sauna.name}</Link>
          </h2>
        </div>
        <div className={styles.details}>
          <p>{sauna.location}</p>
          <p className={styles.price}>
            Alkaen {sauna.pricemin} € / {sauna.eventLength} h
          </p>
          {sauna.notes && <small>{sauna.notes}</small>}
        </div>
      </div>

      <Button
        variant='contained'
        color={isSaunaOnState ? 'error' : 'primary'}
        fullWidth
        startIcon={isSaunaOnState ? <DeleteIcon /> : <AddIcon />}
        onClick={
          isSaunaOnState
            ? (e) => removeSaunaFromState(e, sauna)
            : () => addSaunaToState(sauna)
        }
        className={styles.addButton}
        data-cy={
          isSaunaOnState
            ? `removeButton-${sauna.name}`
            : `addButton-${sauna.name}`
        }
      >
        {isSaunaOnState ? 'Poista tarjouspyynnöstä' : 'Lisää tarjouspyyntöön'}
      </Button>
    </div>
  );
};

export default LauttaEl;
