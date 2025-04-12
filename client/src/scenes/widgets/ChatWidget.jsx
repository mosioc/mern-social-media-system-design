import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  useTheme,
  CircularProgress,
  Collapse,
  Fade,
} from "@mui/material";
import { 
  Send, 
  SmartToy, 
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { addChatMessage } from "state";

const ChatWidget = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const token = useSelector((state) => state.token);
  const messages = useSelector((state) => state.chatMessages);
  const dispatch = useDispatch();
  const { palette } = useTheme();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    dispatch(addChatMessage(userMessage));
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      dispatch(addChatMessage({ 
        role: "assistant", 
        content: data.response 
      }));
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Chat Toggle Button */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed', // change from 'absolute'
          bottom: '20px',
          right: '20px',
          zIndex: 1400
        }}
      >
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'background.alt',
            width: '50px',
            height: '50px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.1)',
            }
          }}
        >
          {isOpen ? <KeyboardArrowDown /> : <SmartToy />}
        </IconButton>
      </Box>

      {/* Mobile Chat Window */}
      <Collapse 
        in={isOpen} 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: { xs: '80px', sm: '80px' }, // Adjust position for mobile
          right: '20px',
          width: 'calc(100% - 40px)',
          maxWidth: '400px',
          zIndex: 1350, // Keep below the toggle button
        }}
      >
        <Fade in={isOpen}>
          <Box>
            <WidgetWrapper>
              <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{ mb: "1.5rem" }}
              >
                Chat Assistant
              </Typography>

              <Box
                sx={{
                  height: "300px",
                  overflowY: "auto",
                  mb: "1rem",
                  p: "0.5rem",
                  backgroundColor: palette.background.alt,
                  borderRadius: "0.75rem",
                }}
              >
                {messages.map((message, i) => (
                  <Box
                    key={i}
                    sx={{
                      mb: "0.5rem",
                      p: "0.5rem",
                      backgroundColor: message.role === "user" ? 
                        palette.primary.light : 
                        palette.background.default,
                      borderRadius: "0.5rem",
                      alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      marginLeft: message.role === "user" ? "auto" : "0",
                    }}
                  >
                    <Typography color={palette.neutral.main}>
                      {message.content}
                    </Typography>
                  </Box>
                ))}
                {isLoading && (
                  <Box display="flex" justifyContent="center" p={1}>
                    <CircularProgress size={20} />
                  </Box>
                )}
              </Box>

              <FlexBetween>
                <InputBase
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    width: "100%",
                    backgroundColor: palette.neutral.light,
                    borderRadius: "2rem",
                    padding: "0.5rem 2rem",
                    marginRight: "1rem",
                  }}
                />
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  sx={{
                    backgroundColor: palette.primary.main,
                    borderRadius: "50%",
                    "&:hover": { backgroundColor: palette.primary.dark },
                  }}
                >
                  <Send sx={{ color: palette.background.alt }} />
                </IconButton>
              </FlexBetween>
            </WidgetWrapper>
          </Box>
        </Fade>
      </Collapse>

      {/* Desktop Chat Window */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <WidgetWrapper>
          <Typography
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Chat Assistant
          </Typography>

          <Box
            sx={{
              height: "300px",
              overflowY: "auto",
              mb: "1rem",
              p: "0.5rem",
              backgroundColor: palette.background.alt,
              borderRadius: "0.75rem",
            }}
          >
            {messages.map((message, i) => (
              <Box
                key={i}
                sx={{
                  mb: "0.5rem",
                  p: "0.5rem",
                  backgroundColor: message.role === "user" ? 
                    palette.primary.light : 
                    palette.background.default,
                  borderRadius: "0.5rem",
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  marginLeft: message.role === "user" ? "auto" : "0",
                }}
              >
                <Typography color={palette.neutral.main}>
                  {message.content}
                </Typography>
              </Box>
            ))}
            {isLoading && (
              <Box display="flex" justifyContent="center" p={1}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          <FlexBetween>
            <InputBase
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 2rem",
                marginRight: "1rem",
              }}
            />
            <IconButton 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              sx={{
                backgroundColor: palette.primary.main,
                borderRadius: "50%",
                "&:hover": { backgroundColor: palette.primary.dark },
              }}
            >
              <Send sx={{ color: palette.background.alt }} />
            </IconButton>
          </FlexBetween>
        </WidgetWrapper>
      </Box>
    </>
  );
};

export default ChatWidget;