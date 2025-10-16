import React from 'react'
import { Typography, Box } from '@mui/material'

const AccountsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Chart of Accounts
      </Typography>
      <Typography variant="body1">
        Manage your chart of accounts, account types, and account balances.
        This page will include account creation, editing, and balance reconciliation features.
      </Typography>
    </Box>
  )
}

export default AccountsPage