type ScoreDisplayProps = {
  score: number
  totalCollectables: number
}

export const ScoreDisplay = ({
  score,
  totalCollectables,
}: ScoreDisplayProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        zIndex: 100,
      }}
    >
      <div>
        <span style={{ fontWeight: 'bold' }}>Score: </span>
        <span>{score}</span>
        <span> / {totalCollectables}</span>
      </div>
    </div>
  )
}
