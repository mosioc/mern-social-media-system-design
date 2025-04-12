import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  ContentCopy,
  Check,
  DeleteOutlined,
  EditOutlined,
  Send
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, InputBase, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, deletePost } from "state";
import moment from "moment";

// Import core Prism first
import Prism from "prismjs";
// Import CSS
import "prismjs/themes/prism.css";
// Import languages after Prism core
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

// Initialize Prism
if (typeof window !== 'undefined') {
  Prism.manual = true;
}

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  createdAt,
  handleSearch, // Add new prop
  post, // Add new prop
  code // Add code prop
}) => {
  const [isComments, setIsComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(description);
  const [commentText, setCommentText] = useState(""); // Add state for comment text
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const isDarkMode = palette.mode === "dark";

  const customThemeStyles = {
    light: {
      background: 'rgb(250, 250, 250)',
      text: '#383A42',
      comment: '#A0A1A7',
      keyword: '#A626A4',
      function: '#4078F2',
      string: '#50A14F',
      number: '#986801',
      class: '#C18401',
      border: '1px solid #E8E8E8'
    },
    dark: {
      background: 'rgb(40, 44, 52)',
      text: '#ABB2BF',
      comment: '#5C6370',
      keyword: '#C678DD',
      function: '#61AFEF',
      string: '#98C379',
      number: '#D19A66',
      class: '#E6C07B',
      operator: '#56B6C2', // Add operator color
      border: '1px solid #3E4451'
    }
  };

  useEffect(() => {
    // Highlight code blocks after component mounts
    if (post?.code) {
      const timer = setTimeout(() => {
        Prism.highlightAll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [post]);

  useEffect(() => {
    // Highlight code blocks when component mounts or code changes
    if (code) {
      const timer = setTimeout(() => {
        Prism.highlightAll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [code]);

  useEffect(() => {
    // Add theme-specific class to pre elements
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
      block.className = isDarkMode ? 'dark-theme' : 'light-theme';
    });
  }, [isDarkMode]);

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleTagClick = (tag) => {
    // Remove # symbol and search for tag
    const searchQuery = tag.substring(1);
    handleSearch(searchQuery);
  };

  const handleCopyCode = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const formatTextWithHashtags = (text) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Typography
            key={index}
            component="span"
            onClick={() => handleTagClick(word)}
            sx={{
              color: primary,
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
          >
            {word}
          </Typography>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

  const handleEditPost = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: editedContent }),
      });
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Dispatch action to remove post from state
        dispatch(deletePost({ postId }));
        console.log("Post deleted");
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText }),
      });
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setCommentText(""); // Clear the input field after adding comment
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      
      {isEditing ? (
        <Box>
          <InputBase
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            fullWidth
            multiline
          />
          <Button onClick={handleSaveEdit}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </Box>
      ) : (
        <Typography color={main} sx={{ mt: "1rem" }}>
          {formatTextWithHashtags(description)}
        </Typography>
      )}
      
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      
      {post?.code && (
        <Box mt="1rem">
          <Typography variant="caption" color="text.secondary">
            {post.code.language}
          </Typography>
          <pre>
            <code className={`language-${post.code.language}`}>
              {post.code.content}
            </code>
          </pre>
        </Box>
      )}
      {/* Add code display section */}
      {code && (
        <Box mt="1rem">
          <FlexBetween mb={1}>
            <Typography variant="caption" color="text.secondary">
              {code.language}
            </Typography>
            <IconButton 
              onClick={() => handleCopyCode(code.content)}
              size="small"
              sx={{
                backgroundColor: palette.background.alt,
                '&:hover': {
                  backgroundColor: palette.background.default,
                },
              }}
            >
              {copied ? (
                <Check sx={{ fontSize: "20px", color: palette.primary.main }} />
              ) : (
                <ContentCopy sx={{ fontSize: "20px" }} />
              )}
            </IconButton>
          </FlexBetween>
          <Box
            sx={{
              position: 'relative',
              '& pre': {
                margin: 0,
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: isDarkMode ? 
                  customThemeStyles.dark.background : 
                  customThemeStyles.light.background,
                border: isDarkMode ?
                  customThemeStyles.dark.border :
                  customThemeStyles.light.border,
                overflow: 'auto',
                maxHeight: '400px',
              },
              '& code': {
                fontFamily: 'Fira Code, Consolas, Monaco, monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: isDarkMode ? 
                  customThemeStyles.dark.text : 
                  customThemeStyles.light.text,
              },
              // Syntax highlighting colors
              '& .token.comment': {
                color: isDarkMode ? 
                  customThemeStyles.dark.comment : 
                  customThemeStyles.light.comment,
                fontStyle: 'italic'
              },
              '& .token.keyword': {
                color: isDarkMode ? 
                  customThemeStyles.dark.keyword : 
                  customThemeStyles.light.keyword,
                fontWeight: 500
              },
              '& .token.function': {
                color: isDarkMode ? 
                  customThemeStyles.dark.function : 
                  customThemeStyles.light.function
              },
              '& .token.string': {
                color: isDarkMode ? 
                  customThemeStyles.dark.string : 
                  customThemeStyles.light.string
              },
              '& .token.number': {
                color: isDarkMode ? 
                  customThemeStyles.dark.number : 
                  customThemeStyles.light.number
              },
              '& .token.class-name': {
                color: isDarkMode ? 
                  customThemeStyles.dark.class : 
                  customThemeStyles.light.class
              },
              '& .token.operator': {
                color: isDarkMode ? 
                  customThemeStyles.dark.operator : 
                  customThemeStyles.light.text,
                background: 'transparent' // Remove background color
              },
              '& .token.punctuation': {
                color: isDarkMode ? 
                  customThemeStyles.dark.text : 
                  customThemeStyles.light.text,
                background: 'transparent'
              },
              '& .token.comparison': {
                color: isDarkMode ? 
                  customThemeStyles.dark.operator : 
                  customThemeStyles.light.text,
                background: 'transparent'
              }
            }}
          >
            <pre>
              <code className={`language-${code.language}`}>
                {code.content}
              </code>
            </pre>
          </Box>
        </Box>
      )}
      {/* Add timestamp */}
      <Typography 
        color={main} 
        fontSize="0.75rem"
        sx={{ 
          mt: "0.5rem",
          fontStyle: "italic" 
        }}
      >
        {moment(createdAt).fromNow()}
      </Typography>
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        {loggedInUserId === postUserId && (
          <FlexBetween gap="0.3rem">
            <IconButton>
              <ShareOutlined />
            </IconButton>
            <IconButton onClick={handleEditPost}>
              <EditOutlined />
            </IconButton>
            <IconButton onClick={handleDeletePost}>
              <DeleteOutlined />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {/* Comment Input */}
          <FlexBetween>
            <InputBase
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddComment();
                }
              }}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
              }}
            />
            <IconButton onClick={handleAddComment} disabled={!commentText.trim()}>
              <Send />
            </IconButton>
          </FlexBetween>
          {/* Comments List */}
          {comments.map((comment, i) => (
            <Box key={`${comment.userId}-${i}`}>
              <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                {comment}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;