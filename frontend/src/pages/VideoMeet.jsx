import { useCallback, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import serverUrl from "../environment.js";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();
    const localStreamRef = useRef(null);

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    const pendingIceCandidatesRef = useRef({});

    // TODO
    // if(isChrome() === false) {


    // }

    const getPermissions = useCallback(async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    localStreamRef.current = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [audioAvailable, videoAvailable]);

    useEffect(() => {
        console.log("HELLO")
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getPermissions();
    }, [getPermissions]);

    function silence() {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    function black({ width = 640, height = 480 } = {}) {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    const getUserMediaSuccess = useCallback((stream) => {
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop())
            }
        } catch (error) {
            console.log(error)
        }

        localStreamRef.current = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(localStreamRef.current)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, { sdp: connections[id].localDescription })
                    })
                    .catch(error => console.log(error))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (error) {
                console.log(error)
            }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            localStreamRef.current = blackSilence()
            localVideoref.current.srcObject = localStreamRef.current

            for (let id in connections) {
                connections[id].addStream(localStreamRef.current)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, { sdp: connections[id].localDescription })
                        })
                        .catch(error => console.log(error))
                })
            }
        })
    }, [socketIdRef]);

    const getUserMedia = useCallback(() => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((error) => console.log(error))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (error) {
                console.log(error);
            }
        }
    }, [audio, audioAvailable, getUserMediaSuccess, video, videoAvailable]);

    const getDislayMediaSuccess = useCallback((stream) => {
        console.log("HERE")
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop())
            }
        } catch (error) {
            console.log(error)
        }

        localStreamRef.current = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(localStreamRef.current)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, { sdp: connections[id].localDescription })
                    })
                    .catch(error => console.log(error))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (error) {
                console.log(error)
            }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            localStreamRef.current = blackSilence()
            localVideoref.current.srcObject = localStreamRef.current

            getUserMedia()

        })
    }, [getUserMedia]);

    const getDislayMedia = useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((error) => console.log(error))
            }
        }
    }, [getDislayMediaSuccess, screen]);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio, getUserMedia])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }

    let gotMessageFromServer = async (fromId, signal) => {
        const connection = connections[fromId];
        if (!connection || fromId === socketIdRef.current) return;

        if (signal.sdp) {
            await connection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const pendingCandidates = pendingIceCandidatesRef.current[fromId] ?? [];
            for (const candidate of pendingCandidates) {
                await connection.addIceCandidate(new RTCIceCandidate(candidate));
            }
            delete pendingIceCandidatesRef.current[fromId];

            if (signal.sdp.type === 'offer') {
                const answer = await connection.createAnswer();
                await connection.setLocalDescription(answer);
                socketRef.current.emit('signal', fromId, { sdp: connection.localDescription });
            }
        } else if (signal.ice) {
            if (connection.remoteDescription) {
                await connection.addIceCandidate(new RTCIceCandidate(signal.ice));
            } else {
                pendingIceCandidatesRef.current[fromId] ??= [];
                pendingIceCandidatesRef.current[fromId].push(signal.ice);
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io(serverUrl)

        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on('chat-message', addMessage)
        socketRef.current.on('user-left', (id) => {
            connections[id]?.close();
            delete connections[id];
            delete pendingIceCandidatesRef.current[id];
            setVideos((currentVideos) => {
                const remainingVideos = currentVideos.filter((video) => video.socketId !== id);
                videoRef.current = remainingVideos;
                return remainingVideos;
            });
        })

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, { ice: event.candidate })
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (localStreamRef.current !== undefined && localStreamRef.current !== null) {
                        connections[socketListId].addStream(localStreamRef.current)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        localStreamRef.current = blackSilence()
                        connections[socketListId].addStream(localStreamRef.current)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(localStreamRef.current)
                        } catch (error) {
                            console.log(error)
                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, { sdp: connections[id2].localDescription })
                                })
                                .catch(error => console.log(error))
                        })
                    }
                }
            })
        })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (error) {
            console.log(error)
        }
        window.location.href = "/"
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !socketRef.current?.connected) return;

        socketRef.current.emit('chat-message', trimmedMessage, username)
        setMessage("");
    }


    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobbyPage}>
                    <div className={styles.lobbyBackdrop} />
                    <header className={styles.lobbyHeader}>
                        <div className={styles.lobbyBrand}>
                            <span className={styles.lobbyBrandMark}>C</span>
                            <span>onvia</span>
                        </div>
                        <span className={styles.lobbyHeaderLabel}>VIDEO MEETING</span>
                    </header>

                    <main className={styles.lobbyMain}>
                        <section className={styles.lobbyContent}>
                            <div className={styles.lobbyEyebrow}>
                                <span />
                                YOU’RE ALMOST THERE
                            </div>
                            <h1>Make yourself<br /><span>at home.</span></h1>
                            <p className={styles.lobbyDescription}>
                                Choose how you’ll appear, then step into the conversation.
                                Your people are waiting.
                            </p>

                            <div className={styles.lobbyForm}>
                                <label className={styles.lobbyFieldLabel} htmlFor="lobby-username">
                                    YOUR NAME
                                </label>
                                <TextField
                                    className={styles.lobbyNameInput}
                                    id="lobby-username"
                                    label="Enter your name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    variant="outlined"
                                />
                                <Button
                                    className={styles.lobbyConnectButton}
                                    variant="contained"
                                    onClick={connect}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Enter meeting
                                </Button>
                                <div className={styles.lobbyPrivacy}>
                                    <LockOutlinedIcon />
                                    Your call is private and secure
                                </div>
                            </div>
                        </section>

                        <section className={styles.lobbyPreviewSection} aria-label="Camera preview">
                            <div className={styles.lobbyPreviewGlow} />
                            <div className={styles.lobbyPreviewCard}>
                                <div className={styles.lobbyPreviewHeader}>
                                    <span><i /> CAMERA PREVIEW</span>
                                    <span className={styles.lobbyPreviewMenu}>•••</span>
                                </div>
                                <div className={styles.lobbyPreviewScreen}>
                                    <video ref={localVideoref} autoPlay muted playsInline poster="/logo3.png" />
                                    <div className={styles.lobbyPreviewTag}>
                                        <span />
                                        Preview
                                    </div>
                                </div>
                                <div className={styles.lobbyPreviewFooter}>
                                    <span className={styles.lobbyPreviewAvatar}>
                                        {username.trim().charAt(0).toUpperCase() || "Y"}
                                    </span>
                                    <span className={styles.lobbyPreviewName}>
                                        <strong>{username.trim() || "Your name"}</strong>
                                        <small>Ready to join</small>
                                    </span>
                                    <span className={styles.lobbyPreviewCheck}>✓</span>
                                </div>
                            </div>
                            <div className={styles.lobbyTip}>
                                <span className={styles.lobbyTipIcon}><MicIcon /></span>
                                <span>
                                    <strong>Quick tip</strong>
                                    <small>Find a quiet spot for the best call.</small>
                                </span>
                            </div>
                        </section>
                    </main>

                    <footer className={styles.lobbyFooter}>
                        <span>CONVIA</span>
                        <span>A little closer, wherever you are.</span>
                    </footer>
                </div> :


                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {

                                    console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                </div>

            }

        </div>
    )
}