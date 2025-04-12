import React from 'react';
import { Box, Typography, useTheme } from '@mui/material'; // Add useTheme
import FlexBetween from './FlexBetween';
import UserImage from './UserImage';

const SearchResults = ({ searchResults, navigate, setSearchResults, setSearchQuery, background, dark, neutralLight, handleOpenModal }) => {
  const theme = useTheme(); // Add this line to get theme

  return searchResults.users.length > 0 || searchResults.posts.length > 0 ? (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: theme.palette.mode === "dark" 
          ? "rgba(26, 26, 26, 0.8)"  // Dark transparent
          : "rgba(255, 255, 255, 0.8)", // Light transparent
        borderRadius: "0 0 9px 9px",
        backdropFilter: "blur(10px)", // Add blur effect
        boxShadow: theme.palette.mode === "dark"
          ? "0 4px 30px rgba(0, 0, 0, 0.1)"
          : "0 4px 30px rgba(0, 0, 0, 0.05)",
        zIndex: 1000,
        maxHeight: "400px",
        overflowY: "auto",
        border: theme.palette.mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.7)",
      }}
    >
      {/* Users Results */}
      {searchResults.users.length > 0 && (
        <Box p={2}>
          <Typography variant="subtitle2" color={dark}>
            Users
          </Typography>
          {searchResults.users.map((user) => (
            <Box
              key={user._id}
              p={1}
              onClick={() => {
                navigate(`/profile/${user._id}`);
                setSearchResults({ users: [], posts: [] });
                setSearchQuery("");
              }}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: neutralLight },
              }}
            >
              <FlexBetween>
                <UserImage image={user.picturePath} size="30px" />
                <Box ml={2}>
                  <Typography color={dark}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography color={dark} fontSize="0.8rem">
                    @{user.uniqueId}
                  </Typography>
                </Box>
              </FlexBetween>
            </Box>
          ))}
        </Box>
      )}

      {/* Posts Results */}
      {searchResults.posts.length > 0 && (
        <Box p={2}>
          <Typography variant="subtitle2" color={dark}>
            Posts
          </Typography>
          {searchResults.posts.map((post) => (
            <Box
              key={post._id}
              p={1}
              onClick={() => {
                handleOpenModal(post); // Call handleOpenModal with the selected post
                setSearchResults({ users: [], posts: [] });
                setSearchQuery("");
              }}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: neutralLight },
              }}
            >
              <Typography color={dark} noWrap>
                {post.description}
              </Typography>
              <Typography color={dark} fontSize="0.8rem">
                by {post.firstName} {post.lastName}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  ) : null;
};

export default SearchResults;