import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'
import Game from './pages/Game'

const exampleWorld = [
  [1, 1, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 1, 1],
  [0, 1, 0, 1],
]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
          }
        />
        <Route path="/game" element={<Game worldData={exampleWorld} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
