import { Routes, Route } from 'react-router-dom'
import Test from '../mypages/Test.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Test</div>} />
    </Routes>
  )
}

export default App
