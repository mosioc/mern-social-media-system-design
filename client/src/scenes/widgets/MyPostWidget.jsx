import React, { useState } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
  CodeOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MAX_CHARS = 500;
const MAX_CODE_CHARS = 3000;

const shakeAnimation = {
  "@keyframes shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
    "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
  },
};

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const charCount = post.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    if (code) {
      formData.append(
        "code",
        JSON.stringify({
          content: code,
          language: codeLanguage,
        })
      );
    }
    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    try {
      const response = await fetch(`http://localhost:3001/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const posts = await response.json();
      dispatch(setPosts({ posts }));
      setImage(null);
      setPost("");
      setCode("");
      setIsCode(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        {isNonMobileScreens && <UserImage image={picturePath} />}
        <Box sx={{ width: "100%" }}>
          <InputBase
            placeholder="What's on your mind..."
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setPost(e.target.value);
              }
            }}
            value={post}
            multiline
            minRows={3}
            maxRows={10}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              overflowWrap: "break-word",
              wordBreak: "break-word",
              borderRadius: "2rem",
              padding: {
                xs: "1rem 1rem", // Adjust padding for mobile screens
                sm: "1rem 2rem", // Default padding for larger screens
              },
            }}
          />
          <Typography
            sx={{
              color: charCount >= MAX_CHARS ? "red" : "inherit",
              animation: charCount >= MAX_CHARS ? "shake 0.5s" : "none",
              ...shakeAnimation,
              textAlign: "right",
              mt: "0.5rem",
            }}
          >
            {charCount}/{MAX_CHARS}
          </Typography>
        </Box>
      </FlexBetween>
      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      {isCode && (
        <Box mt="1rem">
          <Select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            sx={{ mb: 1 }}
          >
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            {/* Add more languages as needed */}
          </Select>
          <InputBase
            placeholder="Add your code here..."
            onChange={(e) => {
              if (e.target.value.length <= MAX_CODE_CHARS) {
                setCode(e.target.value);
              }
            }}
            value={code}
            multiline
            rows={5}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "0.5rem",
              padding: "1rem",
              fontFamily: "monospace",
            }}
          />
          <Typography
            sx={{
              color: code.length >= MAX_CODE_CHARS ? "red" : "inherit",
              textAlign: "right",
              mt: "0.5rem",
            }}
          >
            {code.length}/{MAX_CODE_CHARS}
          </Typography>
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.25rem">
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Clip</Typography>
            </FlexBetween>

            <FlexBetween gap="0.25rem">
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Attachment</Typography>
            </FlexBetween>

            <FlexBetween gap="0.25rem">
              <MicOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Audio</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.25rem">
            <MoreHorizOutlined sx={{ color: mediumMain }} />
          </FlexBetween>
        )}

        <FlexBetween gap="0.25rem" onClick={() => setIsCode(!isCode)}>
          <CodeOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Code
          </Typography>
        </FlexBetween>

        <Button
          disabled={!post || isOverLimit}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          POST
        </Button>
      </FlexBetween>

      {/* Modal for displaying selected post */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Post Details</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <>
              <Typography variant="h6">{selectedPost.description}</Typography>
              {selectedPost.picturePath && (
                <img
                  src={`http://localhost:3001/assets/${selectedPost.picturePath}`}
                  alt="Post"
                  style={{ width: "100%", marginTop: "1rem" }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
