import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import VideoMeeting from "./pages/VideoMeeting.jsx";
import Home from "./pages/Home.jsx";
import { HistoryProvider } from "./context/HistoryContext.jsx";
import History from "./pages/History.jsx";


function App() {

  return (
    <div className='app'>
      <Router>
        <AuthProvider>
          <HistoryProvider>
            <Routes>
              <Route path='/' element={<LandingPage />} ></Route>
              <Route path='/auth' element={<Authentication />}></Route>
              <Route path="/home" element={<Home />}></Route>
              <Route path="/history" element={<History />}></Route>
              <Route path="/meet/:url" element={<VideoMeeting />}></Route>
            </Routes>
          </HistoryProvider>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App
