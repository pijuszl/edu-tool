import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'
import Game from './pages/Game'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <h1 className="text-3xl font-bold underline">
              Sveiki! Žaidimas yra /game puslapyje
            </h1>
          }
        />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
