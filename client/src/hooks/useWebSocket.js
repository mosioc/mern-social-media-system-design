import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addPosts, setPost } from 'state';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

export const useWebSocket = () => {
  const ws = useRef(null);
  const retryCount = useRef(0);
  const dispatch = useDispatch();

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        retryCount.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'NEW_POST':
              dispatch(addPosts({ posts: [data.post] }));
              break;
            case 'UPDATE_POST':
              dispatch(setPost({ post: data.post }));
              break;
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(connect, RETRY_DELAY);
        } else {
          console.error('Max retry attempts reached. WebSocket connection failed.');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);
}; 