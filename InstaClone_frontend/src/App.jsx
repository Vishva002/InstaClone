import React from 'react'
import './App.css'
import './index.css'
import Sidebar from './SideBar/Sidebar'
import Feed from './feed/Feed'
import RightBar from './rightBar/RightBar'

function App() {
  return (
    <div className ="d-flex vh-100">
      <div className="w-20 " ><Sidebar /></div>
      <div className="w-50 " ><Feed /></div>
      <div className="w-30 " ><RightBar /></div>
    </div>
  )
}

export default App