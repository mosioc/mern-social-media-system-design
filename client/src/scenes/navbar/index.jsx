import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Settings,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import SearchResults from "components/SearchResults";


const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const isMobile = useMediaQuery("(max-width: 999px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        fetch(`http://localhost:3001/users/search?query=${searchQuery}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:3001/posts/search?query=${searchQuery}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [users, posts] = await Promise.all([
        usersResponse.json(),
        postsResponse.json(),
      ]);
      setSearchResults({ users, posts });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleOpenModal = (post) => {
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // Add useEffect for scroll lock
  useEffect(() => {
    if (isMobileMenuToggled) {
      // Prevent scrolling on body when nav is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when nav is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuToggled]);

  useEffect(() => {
    if (isMobileMenuToggled) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuToggled]);

  useEffect(() => {
    const handleCloseOnScroll = () => {
      setIsMobileMenuToggled(false);
    };
    if (isMobileMenuToggled) {
      window.addEventListener('wheel', handleCloseOnScroll, { passive: false });
      window.addEventListener('touchmove', handleCloseOnScroll, { passive: false });
    }
    return () => {
      window.removeEventListener('wheel', handleCloseOnScroll, { passive: false });
      window.removeEventListener('touchmove', handleCloseOnScroll, { passive: false });
    };
  }, [isMobileMenuToggled]);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Kooroky
        </Typography>
        {isNonMobileScreens && (
          <Box sx={{ position: "relative", width: "400px" }}>
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="9px"
              gap="3rem"
              padding="0.1rem 1.5rem"
            >
              <InputBase
                placeholder="Type ID, Name or Content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <IconButton onClick={handleSearch}>
                <Search />
              </IconButton>
            </FlexBetween>

            {/* Search Results Dropdown */}
            <SearchResults
              searchResults={searchResults}
              navigate={navigate}
              setSearchResults={setSearchResults}
              setSearchQuery={setSearchQuery}
              background={background}
              dark={dark}
              neutralLight={neutralLight}
              handleOpenModal={handleOpenModal}
            />
          </Box>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <Message sx={{ fontSize: "25px" }} />
          <Notifications sx={{ fontSize: "25px" }} />
          <IconButton onClick={() => navigate(`/profile/${user._id}`)}>
            <Settings sx={{ fontSize: "25px" }} />
          </IconButton>
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <FlexBetween gap="1rem">
          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>
          <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
            <Menu />
          </IconButton>
        </FlexBetween>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgcolor="rgba(0,0,0,0.5)"
            zIndex={1200}
            sx={{
              opacity: isMobileMenuToggled ? 1 : 0,
              visibility: isMobileMenuToggled ? "visible" : "hidden",
              transition: "opacity 0.3s ease, visibility 0.3s ease",
              pointerEvents: isMobileMenuToggled ? "auto" : "none",
              overflow: "hidden" // Prevent scroll on overlay
            }}
            onClick={() => setIsMobileMenuToggled(false)}
          />

          {/* Sidebar */}
          <Box
            position="fixed"
            right="0"
            top="0"
            height="100%"
            zIndex={1300}
            maxWidth="300px"
            width="85%"
            bgcolor={background}
            sx={{
              transform: isMobileMenuToggled ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s ease-in-out",
              visibility: isMobileMenuToggled ? "visible" : "hidden",
              boxShadow: "-4px 0 10px rgba(0,0,0,0.1)",
              overflowY: "auto"
            }}
          >
            {/* CLOSE ICON */}
            <Box display="flex" justifyContent="flex-end" p="1rem">
              <IconButton 
                onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
                sx={{
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Welcome Message */}
            <Box 
              p="1.5rem"
              sx={{
                textAlign: "center",
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h5" sx={{ mb: 1 }}>
                Welcome back,
              </Typography>
              <Typography 
                variant="h4" 
                color="primary"
                sx={{ 
                  fontWeight: "bold",
                  mb: 2 
                }}
              >
                {user.firstName}!
              </Typography>
            </Box>

            {/* MENU ITEMS */}
            <FlexBetween
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
              gap="2rem"
              p="2rem"
            >
              {/* Dark/Light Mode */}
              <FlexBetween 
                gap="1rem" 
                sx={{ width: "100%", cursor: "pointer" }}
                onClick={() => dispatch(setMode())}
              >
                <FlexBetween gap="1rem">
                  {theme.palette.mode === "dark" ? (
                    <DarkMode sx={{ fontSize: "25px" }} />
                  ) : (
                    <LightMode sx={{ color: dark, fontSize: "25px" }} />
                  )}
                  <Typography color={dark}>
                    {theme.palette.mode === "dark" ? "Dark Mode" : "Light Mode"}
                  </Typography>
                </FlexBetween>
              </FlexBetween>

              {/* Messages */}
              <FlexBetween gap="1rem" sx={{ width: "100%", cursor: "pointer" }}>
                <FlexBetween gap="1rem">
                  <Message sx={{ fontSize: "25px" }} />
                  <Typography color={dark}>Messages</Typography>
                </FlexBetween>
              </FlexBetween>

              {/* Notifications */}
              <FlexBetween gap="1rem" sx={{ width: "100%", cursor: "pointer" }}>
                <FlexBetween gap="1rem">
                  <Notifications sx={{ fontSize: "25px" }} />
                  <Typography color={dark}>Notifications</Typography>
                </FlexBetween>
              </FlexBetween>

              {/* Settings */}
              <FlexBetween 
                gap="1rem" 
                sx={{ width: "100%", cursor: "pointer" }}
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <FlexBetween gap="1rem">
                  <Settings sx={{ fontSize: "25px" }} />
                  <Typography color={dark}>Profile</Typography>
                </FlexBetween>
              </FlexBetween>

              {/* User Menu */}
              <FormControl variant="standard" value={fullName} sx={{ width: "100%" }}>
                <Select
                  value={fullName}
                  sx={{
                    backgroundColor: neutralLight,
                    width: "150px",
                    borderRadius: "0.25rem",
                    p: "0.25rem 1rem",
                    "& .MuiSvgIcon-root": {
                      pr: "0.25rem",
                      width: "3rem",
                    },
                    "& .MuiSelect-select:focus": {
                      backgroundColor: neutralLight,
                    },
                  }}
                  input={<InputBase />}
                >
                  <MenuItem value={fullName}>
                    <Typography>{fullName}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
                </Select>
              </FormControl>
            </FlexBetween>
          </Box>
        </>
      )}

      {/* MOBILE SEARCH PANEL */}
      <Dialog
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(26, 26, 26, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            boxShadow: theme.palette.mode === "dark"
              ? "0 4px 30px rgba(0, 0, 0, 0.1)"
              : "0 4px 30px rgba(0, 0, 0, 0.05)",
            border: theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.7)",
          }
        }}
      >
        <DialogTitle sx={{ px: 2, py: 1 }}>
          <FlexBetween>
            <Typography>Search</Typography>
            <IconButton onClick={() => setIsSearchOpen(false)}>
              <Close />
            </IconButton>
          </FlexBetween>
        </DialogTitle>

        <DialogContent 
          sx={{ 
            p: 0, 
            display: "flex", 
            flexDirection: "column", 
            height: "100vh",
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(26, 26, 26, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Search Input - Fixed at top */}
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <FlexBetween
              sx={{
                backgroundColor: theme.palette.mode === "dark" 
                  ? "rgba(26, 26, 26, 0.6)"
                  : "rgba(255, 255, 255, 0.6)",
                borderRadius: "9px",
                gap: "1rem",
                padding: "0.25rem 0.75rem"
              }}
            >
              <InputBase
                placeholder="Type ID, Name or Content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                fullWidth
              />
              <IconButton onClick={handleSearch}>
                <Search />
              </IconButton>
            </FlexBetween>
            
          </Box>

          {/* Search Results - Visible without scrolling */}
          <Box 
            sx={{ 
              p: 2, 
              flexGrow: 1,
              backgroundColor: "transparent",
            }}
          >
            <SearchResults
              searchResults={searchResults}
              navigate={navigate}
              setSearchResults={setSearchResults}
              setSearchQuery={setSearchQuery}
              background={background}
              dark={dark}
              neutralLight={neutralLight}
              handleOpenModal={handleOpenModal}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal for displaying selected post */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "1rem",
            overflow: "hidden",
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(26, 26, 26, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            boxShadow: theme.palette.mode === "dark"
              ? "0 4px 30px rgba(0, 0, 0, 0.1)"
              : "0 4px 30px rgba(0, 0, 0, 0.05)",
            border: theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.7)",
          }
        }}
      >
        {selectedPost && (
          <>
            {/* Header with user info */}
            <DialogTitle>
              <Box onClick={() => navigate(`/profile/${selectedPost.userId}`)}>
                <UserImage image={selectedPost.userPicturePath} size="60px" />
              </Box>
              <Box>
                <Typography variant="h6">
                  {selectedPost.firstName} {selectedPost.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPost.location}
                </Typography>
              </Box>
            </DialogTitle>

            {/* Content */}
            <DialogContent>
              {selectedPost ? (
                <>
                  <Typography variant="body1">
                    {selectedPost.description}
                  </Typography>
                  {selectedPost.picturePath && (
                    <Box>
                      <img 
                        src={`http://localhost:3001/assets/${selectedPost.picturePath}`}
                        alt="Post"
                        style={{width: "100%"}}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Typography>Post not available</Typography>
              )}
            </DialogContent>

            <DialogActions 
              sx={{ 
                p: 2,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`
              }}
            >
              <Button 
                onClick={handleCloseModal} 
                variant="contained"
                sx={{ 
                  borderRadius: "2rem",
                  textTransform: "none"
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </FlexBetween>
  );
};

export default Navbar;
