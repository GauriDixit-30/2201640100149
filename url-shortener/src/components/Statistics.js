import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Delete,
  OpenInNew
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import logger from '../middleware/logger';
import urlManager from '../utils/urlUtils';

const Statistics = () => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    loadURLs();
    logger.info('Statistics page loaded');
  }, []);

  const loadURLs = () => {
    const allUrls = urlManager.getAllURLs();
    setUrls(allUrls);
  };

  const handleDelete = (shortCode) => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      if (urlManager.deleteURL(shortCode)) {
        loadURLs();
        logger.info('URL deleted from statistics page', { shortCode });
      }
    }
  };

  const handleRedirect = (shortCode) => {
    window.open(`/${shortCode}`, '_blank');
  };

  if (urls.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          No shortened URLs found. Create some URLs on the shortening page first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph align="center">
          Analytics for all your shortened URLs
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.shortCode}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {window.location.origin}/{url.shortCode}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {url.longURL}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(url.createdAt).toLocaleString()}
                    <br />
                    <Typography variant="caption">
                      ({formatDistanceToNow(new Date(url.createdAt))} ago)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(url.expiry).toLocaleString()}
                    <br />
                    <Typography variant="caption">
                      ({formatDistanceToNow(new Date(url.expiry))} left)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={url.clicks.length} 
                      color={url.clicks.length > 0 ? "primary" : "default"}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRedirect(url.shortCode)}
                      title="Open short URL"
                    >
                      <OpenInNew />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(url.shortCode)}
                      title="Delete URL"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {urls.map((url) => (
          <Accordion key={url.shortCode} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                Click Details for {window.location.origin}/{url.shortCode}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {url.clicks.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No clicks recorded yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {url.clicks.map((click, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(click.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{click.source}</TableCell>
                          <TableCell>{click.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
};

export default Statistics;