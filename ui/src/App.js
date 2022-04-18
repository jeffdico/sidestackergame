
import './App.css';
 

import { Routes, Route, useLocation, useNavigate } from "react-router-dom";


import "bootstrap/dist/css/bootstrap.min.css"

import IntroComp from "./page/introcomp.js"
import PlayComp from "./page/playcomp.js"


function App() {

  const location = useLocation()
  const  navigate = useNavigate()

  return (<div className='container'>
    
    <div className="row">
       
      <Routes>                 
          <Route path="/plays/:session" exact element={<PlayComp loc={location} navigate={navigate} />}/>
          <Route path="/" exact element={<IntroComp  loc={location} navigate={navigate}/>}/>       
      </Routes>

    </div>
  </div>

  );
}

export default App;
