import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Typography, Button, Box } from '@mui/material';
import { Home } from '@mui/icons-material';
import logger from '../middleware/logger';
import urlManager from '../utils/urlUtils';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const redirect = async () => {
      try {
        logger.info('Redirect attempt', { shortCode });
        
        const longURL = urlManager.recordClick(shortCode, 'direct');
        
        if (longURL) {
          logger.info('Redirecting to long URL', { shortCode, longURL });
          // Delay slightly to show the loading state
          setTimeout(() => {
            window.location.href = longURL;
          }, 1500);
        } else {
          setStatus('error');
          setError('This shortened URL does not exist or has expired.');
          logger.warn('Redirect failed - URL not found or expired', { shortCode });
        }
      } catch (error) {
        setStatus('error');
        setError('An error occurred during redirection.');
        logger.error('Redirect error', { shortCode, error });
      }
    };

    redirect();
  }, [shortCode, navigate]);

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Redirecting you to the website...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
      
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"  // Fixed from "container" to "contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default RedirectHandler;