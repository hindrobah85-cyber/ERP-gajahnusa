import React from 'react'
import { Typography, Box } from '@mui/material'

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Configure system settings, user preferences, company information, and integrations.
        This page will include user management, system configuration, and API settings.
      </Typography>
    </Box>
  )
}

export default SettingsPage