import { Divider, styled } from '@mui/material'

type PageDividerProps = {
  isDragging: boolean
  onMouseDown: () => void
}

const StyledDivider = styled(Divider)(({ theme }) => ({
  width: '8px',
  cursor: 'col-resize',
  backgroundColor: theme.palette.grey[300],
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  '&.active': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const PageDivider = ({ isDragging, onMouseDown }: PageDividerProps) => {
  return (
    <StyledDivider
      orientation="vertical"
      className={isDragging ? 'active' : ''}
      onMouseDown={onMouseDown}
    />
  )
}

export default PageDivider
