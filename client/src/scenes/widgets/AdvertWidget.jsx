import { Typography, useTheme, IconButton, Box, Link } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useEffect } from "react";

const AdvertWidget = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;

  const fetchRssFeed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/hn-feed');
      const data = await response.json();
      setArticles(data.slice(0, 5)); // Get first 5 articles
    } catch (error) {
      console.error('Failed to fetch RSS feed:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRssFeed();
  }, []);

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
        For You
        </Typography>
        <IconButton 
          onClick={fetchRssFeed} 
          disabled={isLoading}
          sx={{
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'rotate(180deg)' }
          }}
        >
          <Refresh />
        </IconButton>
      </FlexBetween>

      <Box mt="1rem">
        {articles.map((article, index) => (
          <Box key={index} mb="1rem">
            <Link
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: palette.neutral.main,
                textDecoration: 'none',
                '&:hover': {
                  color: palette.primary.main,
                  textDecoration: 'underline'
                }
              }}
            >
              <Typography>{article.title}</Typography>
            </Link>
            <Typography variant="caption" color={medium}>
              {article.pubDate}
            </Typography>
          </Box>
        ))}
      </Box>
    </WidgetWrapper>
  );
};

export default AdvertWidget;
