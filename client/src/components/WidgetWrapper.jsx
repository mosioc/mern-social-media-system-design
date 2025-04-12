import { Box } from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.5rem 1.5rem 0.75rem 1.5rem",
  backgroundColor: theme.palette.mode === "dark" 
    ? "rgba(26, 26, 26, 0.8)"  // Dark transparent
    : "rgba(255, 255, 255, 0.8)", // Light transparent
  borderRadius: "0.75rem",
  backdropFilter: "blur(10px)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 4px 30px rgba(0, 0, 0, 0.1)"
    : "0 4px 30px rgba(0, 0, 0, 0.05)",
  border: theme.palette.mode === "dark"
    ? "1px solid rgba(255, 255, 255, 0.1)"
    : "1px solid rgba(255, 255, 255, 0.7)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 6px 40px rgba(0, 0, 0, 0.2)"
      : "0 6px 40px rgba(0, 0, 0, 0.1)",
  }
}));

export default WidgetWrapper;
