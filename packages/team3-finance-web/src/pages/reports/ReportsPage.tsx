import React from 'react'
import { Typography, Box } from '@mui/material'

const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Reports
      </Typography>
      <Typography variant="body1">
        Generate comprehensive financial reports including Balance Sheet, Income Statement, Cash Flow, and Trial Balance.
        This page will include customizable report parameters, export options, and scheduled reporting.
      </Typography>
    </Box>
  )
}

export default ReportsPage