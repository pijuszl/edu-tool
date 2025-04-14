// src/components/CodeEditor/InvalidCodeDialog.tsx
import React from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'

interface InvalidCodeDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Dialog component displayed when trying to switch modes with invalid code
 */
const InvalidCodeDialog: React.FC<InvalidCodeDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Invalid Code</DialogTitle>
      <DialogContent>
        The current code contains syntax errors. If you switch modes, all code
        will be deleted. Are you sure you want to continue?
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InvalidCodeDialog
