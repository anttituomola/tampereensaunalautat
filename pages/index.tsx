import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import LauttaEl from "../components/LauttaEl";
import Filters from "components/Filters";
import { useState, useEffect } from "react";
import { Button, Collapse, Stack } from "@mui/material";
import SelectedSaunas from "components/SelectedSaunas";
import { saunas } from "../saunadata";
import { FilterState, SaunaEquipment, Saunalautta } from "../types";
import { isWinterSeason } from "../utils/dateUtils";

interface Props {
  saunas: Saunalautta[];
}

const Home: NextPage<Props> = () => {
  const initialState: FilterState = {
    location: "",
    capacity: 0,
    sort: "",
    winter: false,
    equipment: [
      { name: "WC", checked: false },
      { name: "Suihku", checked: false },
      { name: "Pukuhuone", checked: false },
      { name: "Kattoterassi", checked: false },
      { name: "Palju", checked: false },
      { name: "Poreallas", checked: false },
      { name: "Kylmäsäilytys", checked: false },
      { name: "Grilli", checked: false },
      { name: "TV", checked: false },
      { name: "Äänentoisto", checked: false },
      { name: "Mikroaaltouuni", checked: false },
    ],
  };

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialState);
  const [saunasOnState, setSaunasOnState] = useState<Saunalautta[]>([]);

  // Get initial saunasOnState from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.getItem("saunasOnState")
        ? setSaunasOnState(
            JSON.parse(localStorage.getItem("saunasOnState") || "[]")
          )
        : [];
    }
  }, []);

  // Save saunasOnState to localStorage
  useEffect(() => {
    localStorage.setItem("saunasOnState", JSON.stringify(saunasOnState));
  }, [saunasOnState]);

  // Show saunas based on filters
  const filteredSaunas = saunas.filter((sauna) => {
    if (filters.winter && !sauna.winter) {
      return false;
    }

    if (filters.location === "ei väliä") {
      return sauna.capacity >= filters.capacity;
    } else {
      return (
        sauna.location.toLowerCase().includes(filters.location.toLowerCase()) &&
        sauna.capacity >= filters.capacity
      );
    }
  });

  // Sort saunas based on pricemin or capacity
  const sortedSaunas = filteredSaunas.sort((a, b) => {
    if (filters.sort === "koko") {
      return b.capacity - a.capacity;
    } else {
      return a.pricemin - b.pricemin;
    }
  });

  // Show only saunas with checked equipment
  const selectedEquipment = filters.equipment.filter(
    (equipment) => equipment.checked
  );
  const filteredSaunasWithEquipment = sortedSaunas.filter((sauna) => {
    return selectedEquipment.every((equipment) =>
      sauna.equipment.includes(equipment.name)
    );
  });
  const hiddenSaunas = saunas.length - filteredSaunasWithEquipment.length;

  const handleWinterFilter = () => {
    setShowFilters(true);
    setFilters({
      ...filters,
      winter: true,
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Tampereen saunalautat</title>
      </Head>

      <div className={styles.main}>
        <h1>Tampereen saunalautat</h1>
        {saunasOnState.length > 0 && (
          <SelectedSaunas
            saunasOnState={saunasOnState}
            setSaunasOnState={setSaunasOnState}
          />
        )}

        {/* Stack component for horizontal button layout */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 5 }}
        >
          <Button
            color={`${showFilters ? "error" : "primary"}`}
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            fullWidth // Makes button take full width on mobile
          >
            Järjestä / suodata
          </Button>

          {!showFilters && !filters.winter && isWinterSeason() && (
            <Button
              color="secondary"
              variant="outlined"
              onClick={handleWinterFilter}
              fullWidth // Makes button take full width on mobile
            >
              Näytä talvikäytössä olevat
            </Button>
          )}
        </Stack>

        <Collapse in={showFilters}>
          {showFilters && <Filters setFilters={setFilters} filters={filters} />}
        </Collapse>
        {hiddenSaunas > 0 && (
          <>
            <p className="hiddenSaunas">{`${hiddenSaunas} saunaa piilotettu.`}</p>
            <Button
              size="small"
              sx={{ mb: 5 }}
              color="secondary"
              variant="outlined"
              onClick={() => setFilters(initialState)}
            >
              Näytä kaikki saunat
            </Button>
          </>
        )}
      </div>
      <main>
        <div className={styles.saunaContainer}>
          {filteredSaunasWithEquipment.map((sauna) => (
            <LauttaEl
              key={sauna.id}
              sauna={sauna}
              saunasOnState={saunasOnState}
              setSaunasOnState={setSaunasOnState}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
