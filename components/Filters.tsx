import {
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  FormGroup,
  Checkbox,
  Divider,
  Grid,
  Box,
} from "@mui/material";
import styles from "/styles/Filters.module.css";

type Filters = {
  location: string;
  capacity: number;
  sort: string;
  equipment: { name: string; checked: boolean }[];
};

type Props = {
  setFilters: (filters: Filters) => void;
  filters: Filters;
};

const Filters = (props: Props) => {
  const locationSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setFilters({
      ...props.filters,
      location: e.target.value,
    });
  };

  const capacitySelector = (
    event: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    props.setFilters({
      ...props.filters,
      capacity: value as number,
    });
  };

  const sortSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setFilters({
      ...props.filters,
      sort: e.target.value,
    });
  };

  const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...props.filters,
      equipment: props.filters.equipment.map((equipment) => {
        if (equipment.name === e.target.name) {
          return {
            ...equipment,
            checked: e.target.checked,
          };
        }
        return equipment;
      }),
    };
    props.setFilters(newFilters);
  };

  return (
    <Paper elevation={0} className={styles.filters}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box className={styles.filterSection}>
            <FormControl component="fieldset">
              <FormLabel component="legend" className={styles.filterTitle}>
                Sijainti
              </FormLabel>
              <RadioGroup
                aria-label="location"
                defaultValue="ei väliä"
                name="location-selector"
                onChange={locationSelector}
              >
                <FormControlLabel
                  value="Näsijärvi"
                  control={<Radio color="primary" />}
                  label="Näsijärvi"
                />
                <FormControlLabel
                  value="Pyhäjärvi"
                  control={<Radio color="primary" />}
                  label="Pyhäjärvi"
                />
                <FormControlLabel
                  value="ei väliä"
                  control={<Radio color="primary" />}
                  label="Ei väliä"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box className={styles.filterSection}>
            <FormLabel component="legend" className={styles.filterTitle}>
              Matkustajien lukumäärä
            </FormLabel>
            <Box px={2}>
              <Slider
                aria-label="capacity"
                defaultValue={10}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={20}
                onChange={capacitySelector}
                color="primary"
              />
            </Box>
          </Box>

          <Box className={styles.filterSection} mt={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" className={styles.filterTitle}>
                Järjestä
              </FormLabel>
              <RadioGroup
                aria-label="sort"
                defaultValue=""
                name="sort-selector"
                onChange={sortSelector}
              >
                <FormControlLabel
                  value="hinta"
                  control={<Radio color="primary" />}
                  label="Hinnan mukaan"
                />
                <FormControlLabel
                  value="koko"
                  control={<Radio color="primary" />}
                  label="Koon mukaan"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box className={styles.filterSection}>
            <FormControl component="fieldset">
              <FormLabel component="legend" className={styles.filterTitle}>
                Varusteet
              </FormLabel>
              <FormGroup className={styles.equipmentGrid}>
                {props.filters.equipment.map((item) => (
                  <FormControlLabel
                    key={item.name}
                    control={
                      <Checkbox
                        checked={item.checked}
                        onChange={checkboxHandler}
                        name={item.name}
                        color="primary"
                      />
                    }
                    label={item.name}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Filters;
