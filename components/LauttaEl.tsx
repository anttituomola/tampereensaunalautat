import styles from "/styles/LauttaEl.module.css";
import Link from "next/link";
import { Saunalautta } from "types";
import { Button, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

type Props = {
  sauna: Saunalautta;
  setSaunasOnState: React.Dispatch<React.SetStateAction<Saunalautta[]>>;
  saunasOnState: Saunalautta[];
};

const LauttaEl = ({ sauna, setSaunasOnState, saunasOnState }: Props) => {
  const isSaunaOnState = saunasOnState.some((s) => s.id === sauna.id);

  const addSaunaToState = (sauna: Saunalautta) => {
    if (saunasOnState.find((s) => s.id === sauna.id)) {
      return;
    }
    setSaunasOnState([...saunasOnState, sauna]);
    toast.success(`${sauna.name} lisätty tarjouspyyntöön, lomake sivun ylälaidassa`);
  };

  return (
    <div className={`${styles.lauttaEl} ${isSaunaOnState ? styles.selected : ''}`}>
      <div className={styles.content}>
        <Link href={`/saunat/${sauna.url_name}`} key={sauna.id}>
          <div className={styles.imageHolder}>
            <img
              className={`${styles.theImage} ${isSaunaOnState ? styles.grayScaleImage : ''}`}
              src={`/images/${sauna.mainImage}`}
              alt={sauna.name}
            />
            {isSaunaOnState && (
              <div className={styles.selectedOverlay}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Lisätty tarjouspyyntöön"
                  color="primary"
                  className={styles.selectedChip}
                />
              </div>
            )}
          </div>
          <h2 className={styles.title}>{sauna.name}</h2>
        </Link>
        <div className={styles.details}>
          <p>{sauna.location}</p>
          <p className={styles.price}>
            Alkaen {sauna.pricemin} € / {sauna.eventLength} h
          </p>
          {sauna.notes && <small>{sauna.notes}</small>}
        </div>
      </div>

      {!isSaunaOnState && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => addSaunaToState(sauna)}
          className={styles.addButton}
          data-cy={`addButton-${sauna.name}`}
        >
          Lisää tarjouspyyntöön
        </Button>
      )}
    </div>
  );
};

export default LauttaEl;