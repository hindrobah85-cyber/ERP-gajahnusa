import React from 'react'
import { Typography, Box } from '@mui/material'

const InvoicesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Invoices
      </Typography>
      <Typography variant="body1">
        Create, send, and manage customer invoices. Track invoice status and payment history.
        This page will include invoice creation, customization, and automated reminders.
      </Typography>
    </Box>
  )
}

export default InvoicesPage