import { CircularProgress, Box } from "@mui/material";

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}

export default LoadingOverlay;