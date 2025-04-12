import express from "express";
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser();

router.get("/hn-feed", async (req, res) => {
  try {
    const feed = await parser.parseURL('https://news.ycombinator.com/rss');
    res.json(feed.items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RSS feed" });
  }
});

export default router;