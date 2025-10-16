import React from 'react'
import { Typography, Box } from '@mui/material'

const PaymentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Payments
      </Typography>
      <Typography variant="body1">
        Record and manage payments received and made. Process payment batches and reconciliations.
        This page will include payment processing, bank reconciliation, and cash flow management.
      </Typography>
    </Box>
  )
}

export default PaymentsPage