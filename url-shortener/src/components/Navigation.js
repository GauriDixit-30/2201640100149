import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import { Link as LinkIcon, Analytics } from '@mui/icons-material';
import logger from '../middleware/logger';

const Navigation = () => {
  const location = useLocation();

  const handleTabChange = (event, newValue) => {
    logger.info('Navigation tab changed', { newValue });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <LinkIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Tabs 
            value={location.pathname} 
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab 
              iconPosition="start"
              icon={<LinkIcon />} 
              label="Shortener" 
              value="/" 
              component={Link} 
              to="/" 
            />
            <Tab 
              iconPosition="start"
              icon={<Analytics />} 
              label="Statistics" 
              value="/stats" 
              component={Link} 
              to="/stats" 
            />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;