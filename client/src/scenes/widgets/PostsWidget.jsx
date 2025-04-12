import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, addPosts } from "state";
import PostWidget from "./PostWidget";
import { Button, Box, Skeleton } from "@mui/material";
import { debounce } from "lodash";

const PostsWidget = ({ userId, isProfile = false, isFriendsOnly = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fetchPosts = useCallback(async (page) => {
    setIsLoading(true); // Set loading to true
    const endpoint = isFriendsOnly ? 
      `http://localhost:3001/posts/friends/${userId}?page=${page}` : 
      `http://localhost:3001/posts?page=${page}`;
      
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setHasMore(data.hasMore);
    
    if (page === 1) {
      dispatch(setPosts({ posts: data.posts }));
    } else {
      dispatch(addPosts({ posts: data.posts }));
    }
    setIsLoading(false); // Set loading to false
  }, [dispatch, token, userId, isFriendsOnly]);

  const getUserPosts = useCallback(async (page) => {
    setIsLoading(true); // Set loading to true
    const response = await fetch(
      `http://localhost:3001/posts/${userId}/posts?page=${page}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setHasMore(data.hasMore);
    
    if (page === 1) {
      dispatch(setPosts({ posts: data.posts }));
    } else {
      dispatch(addPosts({ posts: data.posts }));
    }
    setIsLoading(false); // Set loading to false
  }, [dispatch, token, userId]);

  const handleSearch = async (searchQuery) => {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/search?query=${searchQuery}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      dispatch(setPosts({ posts: data }));
      setIsSearchActive(true);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleReset = () => {
    setIsSearchActive(false);
    setPage(1);
    if (isProfile) {
      getUserPosts(1);
    } else {
      fetchPosts(1);
    }
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts(page);
    } else {
      fetchPosts(page);
    }
  }, [page, isProfile, fetchPosts, getUserPosts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = debounce(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading || !hasMore) return;
    setPage((prevPage) => prevPage + 1);
  }, 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {isLoading ? (
        // Render skeletons while loading
        Array.from(new Array(5)).map((_, index) => (
          <Box key={index} mb={2}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton width="60%" />
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </Box>
        ))
      ) : (
        posts.map(({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
          createdAt,
          code // Add code to mapped props
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
            createdAt={createdAt}
            code={code} // Pass code data to PostWidget
            handleSearch={handleSearch}
          />
        ))
      )}
      
      {/* Floating Reset Button */}
      {isSearchActive && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: "20px", md: "40px" },
            right: { xs: "20px", md: "40px" },
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            }
          }}
        >
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
        </Box>
      )}
      
      {hasMore && !isLoading && (
        <Box textAlign="center" mt="2rem">
          <Button onClick={() => setPage(page + 1)} variant="contained">
            Load More
          </Button>
        </Box>
      )}
    </>
  );
};

export default PostsWidget;
