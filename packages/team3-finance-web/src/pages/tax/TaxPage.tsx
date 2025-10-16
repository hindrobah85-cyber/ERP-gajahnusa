import React from 'react'
import { Typography, Box } from '@mui/material'

const TaxPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tax Management
      </Typography>
      <Typography variant="body1">
        Calculate, file, and manage tax obligations. Track tax payments and generate tax reports.
        This page will include tax calculation engines, compliance tracking, and filing assistance.
      </Typography>
    </Box>
  )
}

export default TaxPage