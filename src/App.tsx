// src/App.tsx

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import GameLayout from './pages/GameLayout'

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
        <Route path="/game" element={<GameLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
