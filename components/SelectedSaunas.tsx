import styles from "styles/SelectedSaunas.module.css";
import EmailForm from "components/EmailForm";
import Button from "@mui/material/Button";
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
    <div className={styles.selectedSaunas}>
      <h2>Lähetä tarjouspyyntö valituille saunalautoille</h2>

      {props.saunasOnState.map((sauna) => {
        return (
          <>
            <div key={sauna.id}>
              <li>
                <Link href={`/saunat/${sauna.url_name}`}>
                  <a target="_blank">{sauna.name}</a>
                </Link>
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => removeSauna(sauna)}
                />
              </li>
            </div>
          </>
        );
      })}
      <EmailForm saunas={props.saunasOnState} />
    </div>
  );
};
export default SelectedSaunas;
