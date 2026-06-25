import React from 'react'
import './App.css'

function App() {
  return (
    <div className ="d-flex vh-100">
      <div className="w-20 bg-danger" >sidebar</div>
      <div className="w-50 bg-primary" >feed</div>
      <div className="w-30 bg-success" >rightbar</div>
    </div>
  )
}

export default App