// src/App.tsx

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Game from './pages/GameLayout'
import level1 from './assets/world/level1.json'

function App() {
  const initialPosition = { i: 0, j: 0 } // Get from level data

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
        <Route
          path="/game"
          element={
            <Game worldData={level1} initialPosition={initialPosition} />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
