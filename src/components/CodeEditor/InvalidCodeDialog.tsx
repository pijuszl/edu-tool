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
  type: 'run' | 'switch'
}

/**
 * Dialog component displayed when trying to switch modes with invalid code
 */
const InvalidCodeDialog: React.FC<InvalidCodeDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  type,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Klaidingas kodas</DialogTitle>
      {type === 'switch' ? (
        <>
          <DialogContent>
            Esantis kodas turi sintaksės klaidų. Jei pakeisite režimą, visas
            kodas bus ištrintas. Ar tikrai norite tęsti?
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onConfirm} autoFocus>
              Continue
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            Esantis kodas turi sintaksės klaidų. Pataisykite esančias klaidas
            prieš paleidžiant kodą.
          </DialogContent>
          <DialogActions>
            <Button onClick={onConfirm} autoFocus>
              Gerai
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default InvalidCodeDialog
