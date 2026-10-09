import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HistoryIcon from '@mui/icons-material/History';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <main className="homePage">
            <header className="homeNav">
                <div className="homeBrand" aria-label="Convia">
                    <span className="homeBrandMark">C</span>
                    <span>onvia</span>
                </div>

                <nav className="homeActions" aria-label="Account navigation">
                    <Button
                        className="homeHistoryButton"
                        startIcon={<HistoryIcon />}
                        onClick={() => {
                            navigate("/history")
                        }}
                    >
                        History
                    </Button>
                    <span className="homeNavDivider" aria-hidden="true" />
                    <Button
                        className="homeLogoutButton"
                        endIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Log out
                    </Button>
                </nav>
            </header>

            <section className="homeHero">
                <div className="homeContent">
                    <div className="homeEyebrow">
                        <span className="homeEyebrowDot" />
                        YOUR SPACE TO CONNECT
                    </div>
                    <h1>
                        Good conversations
                        <br />
                        start <span>here.</span>
                    </h1>
                    <p className="homeIntro">
                        Bring your people closer. Start a call in seconds, wherever life takes you.
                    </p>

                    <div className="homeJoinCard">
                        <div className="homeJoinHeading">
                            <span className="homeJoinIcon">
                                <VideoCallIcon />
                            </span>
                            <div>
                                <h2>Join a meeting</h2>
                                <p>Have a code? You’re one step away.</p>
                            </div>
                        </div>
                        <div className="homeJoinControls">
                            <TextField
                                className="homeMeetingInput"
                                onChange={e => setMeetingCode(e.target.value)}
                                id="outlined-basic"
                                label="Meeting code"
                                variant="outlined"
                            />
                            <Button
                                className="homeJoinButton"
                                onClick={handleJoinVideoCall}
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                            >
                                Join call
                            </Button>
                        </div>
                        <div className="homePrivacyNote">
                            <LockOutlinedIcon />
                            Your conversations stay private
                        </div>
                    </div>

                    <div className="homeAvailability">
                        <span className="homeAvailabilityDot" />
                        <span>Clear calls. No complications.</span>
                    </div>
                </div>

                <div className="homeVisual" aria-hidden="true">
                    <div className="homeVisualOrb homeVisualOrbOne" />
                    <div className="homeVisualOrb homeVisualOrbTwo" />
                    <div className="homeImageCard">
                        <div className="homeImageTopline">
                            <span className="homeImageLive"><span /> READY WHEN YOU ARE</span>
                            <span className="homeImageDots">•••</span>
                        </div>
                        <img src="/logo3.png" alt="" />
                        <div className="homeImageCaption">
                            <span className="homeCaptionIcon"><VideoCallIcon /></span>
                            <span>
                                <strong>Feels like being there.</strong>
                                <small>Make every moment count.</small>
                            </span>
                            <span className="homeCaptionSignal"><i /><i /><i /></span>
                        </div>
                    </div>
                    <div className="homeFloatingNote">
                        <span className="homeFloatingIcon"><HistoryIcon /></span>
                        <span><strong>Pick up anytime</strong><small>Your people are one call away</small></span>
                    </div>
                </div>
            </section>

            <footer className="homeFooter">
                <span>CONVIA</span>
                <span>Closer, no matter the distance.</span>
            </footer>
        </main>
    )
}


export default HomeComponent