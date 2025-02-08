import { useState, useRef, useEffect } from 'react'
import { Box } from '@mui/material'
import CodeEditor from '../components/CodeEditor'
import Game from '../components/Game'
import PageDivider from '../components/PageDivider'
import levelData from '../assets/world/world1.json'

const GameLayout = () => {
  const [leftWidth, setLeftWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [error, setError] = useState<string | null>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100

    setLeftWidth(Math.min(Math.max(20, newWidth), 80))
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', () => setIsDragging(false))

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', () => setIsDragging(false))
    }
  }, [])

  useEffect(() => {
    if (!levelData.levels) {
      setError('Invalid world data')
    } else if (levelData.levels.length === 0) {
      setError('No levels found in world data')
    } else {
      setError(null)
    }
  }, [levelData])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <CodeEditor width={leftWidth} isDragging={isDragging} />

      <PageDivider
        isDragging={isDragging}
        onMouseDown={() => setIsDragging(true)}
      />

      <Box
        sx={{
          height: '100%',
          width: `${100 - leftWidth}%`,
          bgcolor: 'skyBlue',
          transition: isDragging ? 'none' : 'width 0.3s',
        }}
      >
        {error ? <div>Error: {error}</div> : <Game levels={levelData.levels} />}
      </Box>
    </Box>
  )
}

export default GameLayout
