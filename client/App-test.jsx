import { Routes, Route } from 'react-router-dom'
import '../pages/test-script.js'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Test</div>} />
    </Routes>
  )
}

export default App
