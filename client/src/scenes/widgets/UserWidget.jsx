import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  Twitter,
  LinkedIn,
  Instagram,
  Facebook,
  Settings, // Add Settings import
  PersonRemoveOutlined,
  PersonAddOutlined,
} from "@mui/icons-material";
import { 
  Box, 
  Typography, 
  Divider, 
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Link,
} from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setFriends } from "state";
import { useNavigate } from "react-router-dom";

const MAX_BIO_CHARS = 300;

const shakeAnimation = {
  "@keyframes shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
    "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
  },
};

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const friends = useSelector((state) => state.user?.friends || []); // Add default empty array
  const dispatch = useDispatch();
  
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;

  // Add null check before using find
  const isFriend = Array.isArray(friends) && friends.length > 0 ? 
    friends.find((friend) => friend._id === userId) : 
    false;
  const isOwnProfile = loggedInUserId === userId;

  const patchFriend = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/users/${loggedInUserId}/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update friend status");
      }

      dispatch(setFriends({ friends: data }));
    } catch (err) {
      console.error("Error updating friend status:", err);
    }
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userInfo, setUserInfo] = useState({
    bio: user?.bio || "",
    location: user?.location || "",
    occupation: user?.occupation || "",
    socialLinks: {
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
      instagram: user?.socialLinks?.instagram || "",
      facebook: user?.socialLinks?.facebook || "",
    },
    uniqueId: user?.uniqueId || "", // Add uniqueId to userInfo state
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        bio: user.bio || "",
        location: user.location || "",
        occupation: user.occupation || "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          instagram: user.socialLinks?.instagram || "",
          facebook: user.socialLinks?.facebook || "",
        },
        uniqueId: user.uniqueId || "", // Set uniqueId from user data
      });
    }
  }, [user]);

  const getUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const {
    firstName,
    lastName,
    location,
    occupation,
    viewedProfile,
    impressions,
    uniqueId,
    bio,
    socialLinks,
  } = user;

  const handleUpdateProfile = async () => {
    if (userInfo.bio.length > MAX_BIO_CHARS) {
      setError(`Bio cannot exceed ${MAX_BIO_CHARS} characters.`);
      return;
    }
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(
        `http://localhost:3001/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: userInfo.bio,
            location: userInfo.location,
            occupation: userInfo.occupation,
            socialLinks: userInfo.socialLinks || {},
            uniqueId: userInfo.uniqueId // Pass uniqueId from userInfo state
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data);
      setOpenEdit(false);
      getUser(); // Refresh user data
    } catch (error) {
      setError(error.message || "Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUrl = (url) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!urlPattern.test(url);
  };

  const extractSocialUsername = (url, platform) => {
    if (!url) return "Not linked";
    
    try {
      const urlObj = new URL(url);
      switch (platform) {
        case 'twitter':
          return '@' + urlObj.pathname.split('/').filter(Boolean).pop();
        case 'linkedin':
          return urlObj.pathname.split('/').filter(Boolean).pop();
        case 'instagram':
          return '@' + urlObj.pathname.split('/').filter(Boolean).pop();
        case 'facebook':
          return urlObj.pathname.split('/').filter(Boolean).pop();
        default:
          return url;
      }
    } catch {
      return url;
    }
  };

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
      >
        <FlexBetween gap="1rem">
          <UserImage image={picturePath} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
              onClick={() => navigate(`/profile/${userId}`)}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends?.length} friends</Typography>
          </Box>
        </FlexBetween>

        {/* Add Friend Button */}
        {!isOwnProfile && (
          <IconButton
            onClick={patchFriend}
            sx={{
              backgroundColor: primaryLight,
              p: "0.6rem",
              "&:hover": { backgroundColor: palette.primary.main }
            }}
          >
            {isFriend ? (
              <PersonRemoveOutlined sx={{ color: primaryDark }} />
            ) : (
              <PersonAddOutlined sx={{ color: primaryDark }} />
            )}
          </IconButton>
        )}
      </FlexBetween>

      <Divider />

      {/* User ID Section with Friend Button */}
      <Box p="1rem 0">
        <FlexBetween>
          <Typography color={medium} mb="0.5rem">
            ID: @{uniqueId}
          </Typography>
          
        </FlexBetween>
        {bio && (
          <Typography color={medium} mb="0.5rem">
            Bio: {bio}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      {/* Social Links Section */}
      <Box p="1rem 0">
        <Typography 
          fontSize="1rem" 
          color={main} 
          fontWeight="500" 
          mb="1.5rem"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.1rem",
          }}
        >
          Social Profiles
        </Typography>

        {user.socialLinks && (
          <>
            <FlexBetween gap="1rem" mb="0.8rem">
              <FlexBetween gap="1rem" sx={{ width: '100%', minWidth: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "rgba(29, 161, 242, 0.1)", // Twitter blue with opacity
                    borderRadius: "50%",
                    p: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(29, 161, 242, 0.2)",
                    }
                  }}
                >
                  <Twitter sx={{ color: "#1DA1F2", flexShrink: 0 }} />
                </Box>
                <Box sx={{ 
                  minWidth: 0,
                  width: '100%',
                  maxWidth: 'calc(100% - 40px)'
                }}>
                  <Typography color={main} fontWeight="500" sx={{ flexShrink: 0 }}>
                    Twitter
                  </Typography>
                  <Link 
                    href={user.socialLinks.twitter} 
                    target="_blank" 
                    sx={{ 
                      color: medium,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      wordBreak: 'break-all',
                      width: '100%',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#1DA1F2'
                      }
                    }}
                  >
                    {extractSocialUsername(user.socialLinks.twitter, 'twitter')}
                  </Link>
                </Box>
              </FlexBetween>
            </FlexBetween>

            <FlexBetween gap="1rem" mb="0.8rem">
              <FlexBetween gap="1rem" sx={{ width: '100%', minWidth: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 119, 181, 0.1)", // LinkedIn blue with opacity
                    borderRadius: "50%",
                    p: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(0, 119, 181, 0.2)",
                    }
                  }}
                >
                  <LinkedIn sx={{ color: "#0077B5", flexShrink: 0 }} />
                </Box>
                <Box sx={{ 
                  minWidth: 0,
                  width: '100%',
                  maxWidth: 'calc(100% - 40px)'
                }}>
                  <Typography color={main} fontWeight="500" sx={{ flexShrink: 0 }}>
                    LinkedIn
                  </Typography>
                  <Link 
                    href={user.socialLinks.linkedin} 
                    target="_blank"
                    sx={{ 
                      color: medium,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      wordBreak: 'break-all',
                      width: '100%',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#0077B5'
                      }
                    }}
                  >
                    {extractSocialUsername(user.socialLinks.linkedin, 'linkedin')}
                  </Link>
                </Box>
              </FlexBetween>
            </FlexBetween>

            <FlexBetween gap="1rem" mb="0.8rem">
              <FlexBetween gap="1rem" sx={{ width: '100%', minWidth: 0 }}>
                <Box
                  sx={{
                    background: "linear-gradient(45deg, rgba(405, 0, 126, 0.1), rgba(252, 175, 69, 0.1))",
                    borderRadius: "50%",
                    p: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, rgba(405, 0, 126, 0.2), rgba(252, 175, 69, 0.2))",
                    }
                  }}
                >
                  <Instagram sx={{ color: "#E4405F", flexShrink: 0 }} />
                </Box>
                <Box sx={{ 
                  minWidth: 0,
                  width: '100%',
                  maxWidth: 'calc(100% - 40px)'
                }}>
                  <Typography color={main} fontWeight="500" sx={{ flexShrink: 0 }}>
                    Instagram
                  </Typography>
                  <Link 
                    href={user.socialLinks.instagram} 
                    target="_blank"
                    sx={{ 
                      color: medium,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      wordBreak: 'break-all',
                      width: '100%',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#E4405F'
                      }
                    }}
                  >
                    {extractSocialUsername(user.socialLinks.instagram, 'instagram')}
                  </Link>
                </Box>
              </FlexBetween>
            </FlexBetween>

            <FlexBetween gap="1rem">
              <FlexBetween gap="1rem" sx={{ width: '100%', minWidth: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "rgba(66, 103, 178, 0.1)", // Facebook blue with opacity
                    borderRadius: "50%",
                    p: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(66, 103, 178, 0.2)",
                    }
                  }}
                >
                  <Facebook sx={{ color: "#4267B2", flexShrink: 0 }} />
                </Box>
                <Box sx={{ 
                  minWidth: 0,
                  width: '100%',
                  maxWidth: 'calc(100% - 40px)'
                }}>
                  <Typography color={main} fontWeight="500" sx={{ flexShrink: 0 }}>
                    Facebook
                  </Typography>
                  <Link 
                    href={user.socialLinks.facebook} 
                    target="_blank"
                    sx={{ 
                      color: medium,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      wordBreak: 'break-all',
                      width: '100%',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#4267B2'
                      }
                    }}
                  >
                    {extractSocialUsername(user.socialLinks.facebook, 'facebook')}
                  </Link>
                </Box>
              </FlexBetween>
            </FlexBetween>
          </>
        )}

        {isOwnProfile && (
          <Box
            onClick={() => setOpenEdit(true)}
            sx={{
              mt: "1rem",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                color: palette.primary.light,
              }
            }}
          >
            <EditOutlined sx={{ marginRight: "0.5rem" }} />
            <Typography color={medium}>
              Edit Profile
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Unique ID"
                value={userInfo.uniqueId || uniqueId}
                onChange={(e) => setUserInfo({ 
                  ...userInfo, 
                  uniqueId: e.target.value 
                })}
                margin="normal"
                disabled={!isOwnProfile}
              />
              <TextField
                fullWidth
                label="Bio"
                value={userInfo.bio || ""}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_BIO_CHARS) {
                    setUserInfo({ 
                      ...userInfo, 
                      bio: e.target.value 
                    });
                  }
                }}
                margin="normal"
                multiline
                rows={4}
                helperText={`${userInfo.bio.length}/${MAX_BIO_CHARS}`}
                error={userInfo.bio.length > MAX_BIO_CHARS}
                sx={{
                  "& .MuiFormHelperText-root": {
                    color: userInfo.bio.length >= MAX_BIO_CHARS ? "red" : "inherit",
                    animation: userInfo.bio.length >= MAX_BIO_CHARS ? "shake 0.5s" : "none",
                    ...shakeAnimation,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Location"
                value={userInfo.location || ""}
                onChange={(e) => setUserInfo({ 
                  ...userInfo, 
                  location: e.target.value 
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Occupation"
                value={userInfo.occupation || ""}
                onChange={(e) => setUserInfo({ 
                  ...userInfo, 
                  occupation: e.target.value 
                })}
                margin="normal"
              />
              <Typography color={medium} mt={2} mb={1}>
                Social Links
              </Typography>
              <TextField
                fullWidth
                label="Twitter Profile URL"
                value={userInfo.socialLinks?.twitter || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateUrl(value)) {
                    setUserInfo({
                      ...userInfo,
                      socialLinks: { 
                        ...userInfo.socialLinks, 
                        twitter: value 
                      }
                    });
                  } else {
                    setError("Invalid Twitter URL");
                  }
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="LinkedIn Profile URL"
                value={userInfo.socialLinks?.linkedin || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateUrl(value)) {
                    setUserInfo({
                      ...userInfo,
                      socialLinks: { 
                        ...userInfo.socialLinks, 
                        linkedin: value 
                      }
                    });
                  } else {
                    setError("Invalid LinkedIn URL");
                  }
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Instagram Profile URL"
                value={userInfo.socialLinks?.instagram || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateUrl(value)) {
                    setUserInfo({
                      ...userInfo,
                      socialLinks: { 
                        ...userInfo.socialLinks, 
                        instagram: value 
                      }
                    });
                  } else {
                    setError("Invalid Instagram URL");
                  }
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Facebook Profile URL"
                value={userInfo.socialLinks?.facebook || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateUrl(value)) {
                    setUserInfo({
                      ...userInfo,
                      socialLinks: { 
                        ...userInfo.socialLinks, 
                        facebook: value 
                      }
                    });
                  } else {
                    setError("Invalid Facebook URL");
                  }
                }}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenEdit(false)} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            disabled={isLoading || !isOwnProfile}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default UserWidget;