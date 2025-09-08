import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import { Add, Remove, ContentCopy } from '@mui/icons-material';
import logger from '../middleware/logger';
import urlManager from '../utils/urlUtils';

const UrlShortener = () => {
  const [urls, setUrls] = useState([{ longURL: '', validity: '', shortCode: '' }]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longURL: '', validity: '', shortCode: '' }]);
      logger.info('Added URL input field');
    }
  };

  const handleRemoveUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = [...urls];
      newUrls.splice(index, 1);
      setUrls(newUrls);
      logger.info('Removed URL input field', { index });
    }
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
    
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    let isValid = true;

    urls.forEach((url, index) => {
      if (!url.longURL) {
        newErrors[`${index}-longURL`] = 'URL is required';
        isValid = false;
      } else if (!urlManager.isValidURL(url.longURL)) {
        newErrors[`${index}-longURL`] = 'Please enter a valid URL';
        isValid = false;
      }

      if (url.validity && isNaN(parseInt(url.validity))) {
        newErrors[`${index}-validity`] = 'Validity must be a number';
        isValid = false;
      }

      if (url.shortCode && !urlManager.isValidShortCode(url.shortCode)) {
        newErrors[`${index}-shortCode`] = 'Short code must be alphanumeric and 1-20 characters';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logger.info('URL shortening form submitted');

    if (!validateInputs()) {
      logger.warn('Form validation failed', { errors });
      return;
    }

    const newResults = [];
    
    urls.forEach((url) => {
      try {
        const validityMinutes = url.validity ? parseInt(url.validity) : 30;
        const result = urlManager.createShortURL(
          url.longURL, 
          validityMinutes, 
          url.shortCode || null
        );
        newResults.push(result);
      } catch (error) {
        newResults.push({ error: error.message });
      }
    });

    setResults(newResults);
    logger.info('URLs processed', { success: newResults.filter(r => !r.error).length });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    logger.info('Copied to clipboard', { text });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph align="center">
          Shorten up to 5 URLs at once. Leave validity empty for default 30 minutes.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {urls.map((url, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Long URL"
                    value={url.longURL}
                    onChange={(e) => handleChange(index, 'longURL', e.target.value)}
                    error={!!errors[`${index}-longURL`]}
                    helperText={errors[`${index}-longURL`]}
                    placeholder="https://example.com/very-long-url"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={url.validity}
                    onChange={(e) => handleChange(index, 'validity', e.target.value)}
                    error={!!errors[`${index}-validity`]}
                    helperText={errors[`${index}-validity`] || "Optional - defaults to 30 minutes"}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={10} sm={5}>
                  <TextField
                    fullWidth
                    label="Custom Short Code"
                    value={url.shortCode}
                    onChange={(e) => handleChange(index, 'shortCode', e.target.value)}
                    error={!!errors[`${index}-shortCode`]}
                    helperText={errors[`${index}-shortCode`] || "Optional - alphanumeric only"}
                  />
                </Grid>
                
                <Grid item xs={2} sm={1}>
                  <IconButton 
                    onClick={() => handleRemoveUrl(index)} 
                    disabled={urls.length === 1}
                    color="error"
                  >
                    <Remove />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleAddUrl}
              disabled={urls.length >= 5}
              startIcon={<Add />}
            >
              Add URL
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Shorten URLs
            </Button>
          </Box>
        </Box>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Shortened URLs
            </Typography>
            
            {results.map((result, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {result.error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Error for {urls[index].longURL}: {result.error}
                  </Alert>
                ) : (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Original URL: {result.longURL}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body1" sx={{ flexGrow: 1, fontFamily: 'monospace' }}>
                          {result.shortURL}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(result.shortURL)}
                          title="Copy to clipboard"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Expires: {new Date(result.expiry).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UrlShortener;