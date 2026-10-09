import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/Landing.jsx';
import Authentication from './pages/Authentication.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeetComponent from './pages/Videomeet.jsx';
import HomeComponent from './pages/home.jsx';
import withAuth from './utils/withAuth';
import History from './pages/history';

const AuthenticatedHome = withAuth(HomeComponent);

function App() {
  return (
    <div className="App">

      <Router>

        <AuthProvider>


          <Routes>

            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/home' element={<AuthenticatedHome />} />
            <Route path='/history' element={<History />} />
            <Route path='/:url' element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;