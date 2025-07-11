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
  Box,
} from '@mui/material';
import styles from '/styles/Filters.module.css';
import { Dispatch, SetStateAction } from 'react';
import { FilterState } from 'types';
import { Grid } from '@mui/material';

type Filters = {
  location: string;
  capacity: number;
  sort: string;
  equipment: { name: string; checked: boolean }[];
  winter: boolean;
};

interface FiltersProps {
  setFilters: Dispatch<SetStateAction<FilterState>>;
  filters: FilterState;
}

const Filters = ({ setFilters, filters }: FiltersProps) => {
  const locationSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      location: e.target.value,
    });
  };

  const capacitySelector = (
    event: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    setFilters({
      ...filters,
      capacity: value as number,
    });
  };

  const sortSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      sort: e.target.value,
    });
  };

  const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      equipment: filters.equipment.map((equipment) => {
        if (equipment.name === e.target.name) {
          return {
            ...equipment,
            checked: e.target.checked,
          };
        }
        return equipment;
      }),
    };
    setFilters(newFilters);
  };

  const winterHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      winter: e.target.checked,
    });
  };

  return (
    <Paper elevation={0} className={styles.filters}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box className={styles.filterSection}>
            <FormControl component='fieldset'>
              <FormLabel component='legend' className={styles.filterTitle}>
                <strong>Sijainti</strong>
              </FormLabel>
              <RadioGroup
                aria-label='location'
                defaultValue='ei väliä'
                name='location-selector'
                onChange={locationSelector}
              >
                <FormControlLabel
                  value='Näsijärvi'
                  control={<Radio color='primary' />}
                  label='Näsijärvi'
                />
                <FormControlLabel
                  value='Pyhäjärvi'
                  control={<Radio color='primary' />}
                  label='Pyhäjärvi'
                />
                <FormControlLabel
                  value='ei väliä'
                  control={<Radio color='primary' />}
                  label='Ei väliä'
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box className={styles.filterSection} mt={3}>
            <FormControl component='fieldset'>
              <FormLabel component='legend' className={styles.filterTitle}>
                <strong>Sesonki</strong>
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.winter}
                      onChange={winterHandler}
                      name='winter'
                      color='primary'
                    />
                  }
                  label='Talvi'
                />
              </FormGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box className={styles.filterSection}>
            <FormLabel component='legend' className={styles.filterTitle}>
              <strong>Matkustajien lukumäärä</strong>
            </FormLabel>
            <Box px={2}>
              <Slider
                aria-label='capacity'
                defaultValue={10}
                valueLabelDisplay='auto'
                step={1}
                marks
                min={1}
                max={20}
                onChange={capacitySelector}
                color='primary'
              />
            </Box>
          </Box>

          <Box className={styles.filterSection} mt={3}>
            <FormControl component='fieldset'>
              <FormLabel component='legend' className={styles.filterTitle}>
                <strong>Järjestä</strong>
              </FormLabel>
              <RadioGroup
                aria-label='sort'
                defaultValue=''
                name='sort-selector'
                onChange={sortSelector}
              >
                <FormControlLabel
                  value='hinta'
                  control={<Radio color='primary' />}
                  label='Hinnan mukaan'
                />
                <FormControlLabel
                  value='koko'
                  control={<Radio color='primary' />}
                  label='Koon mukaan'
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box className={styles.filterSection}>
            <FormControl component='fieldset'>
              <FormLabel component='legend' className={styles.filterTitle}>
                <strong>Varusteet</strong>
              </FormLabel>
              <FormGroup className={styles.equipmentGrid}>
                {filters.equipment.map((item) => (
                  <FormControlLabel
                    key={item.name}
                    control={
                      <Checkbox
                        checked={item.checked}
                        onChange={checkboxHandler}
                        name={item.name}
                        color='primary'
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
