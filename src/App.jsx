import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'

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
        <Route
          path="/game"
          element={<h1 class="text-2xl font-bold">Žaidimo puslapis</h1>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
