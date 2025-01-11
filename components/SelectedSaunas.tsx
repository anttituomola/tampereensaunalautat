import styles from "styles/SelectedSaunas.module.css";
import EmailForm from "components/EmailForm";
import {
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import { Saunalautta } from "types";
import { toast } from "react-toastify";

type Props = {
  saunasOnState: Saunalautta[] | [];
  setSaunasOnState: (saunasOnState: Saunalautta[]) => void;
};

const SelectedSaunas = (props: Props) => {
  const removeSauna = (sauna: Saunalautta) => {
    const newSaunasOnState = props.saunasOnState.filter(
      (s) => s.id !== sauna.id
    );
    props.setSaunasOnState(newSaunasOnState);
    toast.success(`${sauna.name} poistettu tarjouspyynnöstä.`);
  };

  return (
    <Paper elevation={0} className={styles.selectedSaunas}>
      <h2>Lähetä tarjouspyyntö valituille saunalautoille</h2>
      <List className={styles.saunaList}>
        {props.saunasOnState.map((sauna) => (
          <ListItem key={sauna.id} className={styles.saunaItem}>
            <ListItemText
              primary={
                <Link
                  href={`/saunat/${sauna.url_name}`}
                  target="_blank"
                  className={styles.saunaLink}
                >
                  {sauna.name}
                </Link>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => removeSauna(sauna)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <EmailForm saunas={props.saunasOnState} />
    </Paper>
  );
};

export default SelectedSaunas;
