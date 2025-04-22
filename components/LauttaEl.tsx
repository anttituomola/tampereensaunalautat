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
import { useState, useEffect, useRef, TouchEvent } from 'react';

type Props = {
  sauna: Saunalautta;
  setSaunasOnState: React.Dispatch<React.SetStateAction<Saunalautta[]>>;
  saunasOnState: Saunalautta[];
};

const LauttaEl = ({ sauna, setSaunasOnState, saunasOnState }: Props) => {
  const isSaunaOnState = saunasOnState.some((s) => s.id === sauna.id);
  const [isHovering, setIsHovering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const imageHolderRef = useRef<HTMLDivElement>(null);
  const carouselTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

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
  }, [sauna]);

  // Auto-advance carousel on hover
  useEffect(() => {
    if (isHovering && allImages.length > 1) {
      carouselTimer.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 2000); // Change image every 2 seconds
    }

    return () => {
      if (carouselTimer.current) {
        clearInterval(carouselTimer.current);
      }
    };
  }, [isHovering, allImages.length]);

  const handlePrevImage = (e: React.MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
    );

    // Reset timer
    if (carouselTimer.current) {
      clearInterval(carouselTimer.current);
      carouselTimer.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 2000);
    }
  };

  const handleNextImage = (e: React.MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);

    // Reset timer
    if (carouselTimer.current) {
      clearInterval(carouselTimer.current);
      carouselTimer.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 2000);
    }
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;

    // Show carousel controls on touch start for mobile
    if (allImages.length > 1) {
      setIsHovering(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && allImages.length > 1) {
      handleNextImage(e);
    } else if (isRightSwipe && allImages.length > 1) {
      handlePrevImage(e);
    } else if (Math.abs(distance) < 10) {
      // If it was just a tap (not a swipe), navigate to sauna page
      navigateToSaunaPage();
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
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

  return (
    <div className={styles.lauttaEl}>
      <div className={styles.content}>
        <div>
          <div
            className={styles.imageHolder}
            ref={imageHolderRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setCurrentImageIndex(0); // Reset to main image when not hovering
            }}
            onClick={navigateToSaunaPage}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              className={styles.theImage}
              src={`/images/${allImages[currentImageIndex]}`}
              alt={sauna.name}
              fill={true}
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              priority={currentImageIndex === 0} // Only prioritize loading the main image
            />

            {/* Always show indicator if multiple images exist */}
            {allImages.length > 1 && (
              <>
                <div className={styles.imageCountIndicator}>
                  {currentImageIndex + 1}/{allImages.length}
                </div>
                <div className={styles.scrollHintOverlay}>
                  <div className={styles.scrollHintIcon}></div>
                </div>
              </>
            )}

            {(isHovering || touchStartX.current !== null) &&
              allImages.length > 1 && (
                <div
                  className={styles.carouselContainer}
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
