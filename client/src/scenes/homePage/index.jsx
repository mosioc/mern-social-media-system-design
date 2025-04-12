import { Box, useMediaQuery, IconButton, Tabs, Tab, Button } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import ChatWidget from "scenes/widgets/ChatWidget";

const HomePage = () => {
  const [showMobileAdvert, setShowMobileAdvert] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldShowChat, setShouldShowChat] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show chat if scrolling up or at top
      setShouldShowChat(
        currentScrollY < lastScrollY || 
        currentScrollY < 100
      );
      
      // Show button if scrolling up or near top, hide when scrolling down
      setShouldShowButton(
        currentScrollY < lastScrollY || 
        currentScrollY < 100
      );

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleReset = () => {
    setIsSearchActive(false);
    // Add any other reset logic needed
  };

  return (
    <Box 
      sx={{
        position: 'relative',
        minHeight: '100vh',
        isolation: 'isolate' // Create stacking context
      }}
    >
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
        position="relative" // Add this
      >
        {/* Left Column */}
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
        )}

        {/* Middle Column */}
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
          sx={{ position: 'relative' }} // Add relative positioning to parent
        >
          <MyPostWidget picturePath={picturePath} />
          
          {/* Mobile Advert Toggle Button */}
          {!isNonMobileScreens && (
            <>
              <Box 
                display="flex" 
                justifyContent="center" 
                mt="1.5rem"
                mb="1.5rem"
              >
                <IconButton
                  onClick={() => setShowMobileAdvert(!showMobileAdvert)}
                  sx={{
                    backgroundColor: "background.alt",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    transform: showMobileAdvert ? "rotate(180deg)" : "rotate(0)",
                    "&:hover": {
                      backgroundColor: "background.alt",
                      opacity: 0.9
                    }
                  }}
                >
                  {showMobileAdvert ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              {/* Mobile Advert Content */}
              <Box
                sx={{
                  height: showMobileAdvert ? "auto" : 0,
                  opacity: showMobileAdvert ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.3s ease-in-out",
                  mb: showMobileAdvert ? "1.5rem" : 0
                }}
              >
                <AdvertWidget />
              </Box>
            </>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Explore Posts" />
              <Tab label="Friends Posts" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <PostsWidget 
              userId={_id} 
              isFriendsOnly={false}
            />
          )}
          {activeTab === 1 && (
            <PostsWidget 
              userId={_id} 
              isFriendsOnly={true}
            />
          )}
        </Box>

        {/* Right Column - Keep only this one instance */}
        {isNonMobileScreens ? (
          <Box flexBasis="26%">
            <AdvertWidget />
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} />
            <Box m="2rem 0" />
            <ChatWidget />
          </Box>
        ) : (
          
          null
        )}
      </Box>

      {/* Floating Components Container */}
      <Box
        sx={{
          position: 'fixed',
          bottom: shouldShowButton ? "20px" : "-100px", // Slide down when hidden
          right: "20px",
          padding: "20px",
          pointerEvents: 'none',
          zIndex: (theme) => theme.zIndex.tooltip,
          transition: "bottom 0.3s ease-in-out",
          '& > *': {
            pointerEvents: 'auto'
          }
        }}
      >
        {!isNonMobileScreens && <ChatWidget />}
        {isSearchActive && (
          <Button
            onClick={handleReset}
            variant="contained"
            sx={{
              borderRadius: "20px",
              padding: { xs: "8px 16px", md: "10px 20px" },
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              minWidth: { xs: "120px", md: "150px" },
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)"
              }
            }}
          >
            Reset View
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
