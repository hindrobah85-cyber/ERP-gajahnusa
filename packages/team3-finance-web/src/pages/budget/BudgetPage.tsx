import React from 'react'
import { Typography, Box } from '@mui/material'

const BudgetPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>
      <Typography variant="body1">
        Create and manage budgets, track budget vs actual performance, and analyze variances.
        This page will include budget planning, approval processes, and variance analysis.
      </Typography>
    </Box>
  )
}

export default BudgetPage