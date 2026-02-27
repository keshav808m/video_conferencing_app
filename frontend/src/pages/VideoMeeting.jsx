import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useRef } from "react";
import io, { connect } from "socket.io-client";
import { useNavigate } from "react-router-dom";


import styles from "../styles/videoMeeting.module.css";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/videocam";
import VideocamOffIcon from "@mui/icons-material/videocamOff";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import Badge from "@mui/material/Badge";
import ChatIcon from '@mui/icons-material/Chat'


const server_url = "http://localhost:8080";


var connections = {};

// STUN for generate IP Address
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

const addTracksToPeer = (pc, stream) => {
    stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
    });
};



export default function VideoMeeting() {

    let routeTo = useNavigate();

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailabe, setVideoAvailabe] = useState(true);

    let [audioAvailabe, setAudioAvailabe] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setShowModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    let videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    const getPermissions = async () => {

        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoPermission) {
                setVideoAvailabe(true);
            } else {
                setVideoAvailabe(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (audioPermission) {
                setAudioAvailabe(true);
            } else {
                setAudioAvailabe(false);
            }

            // Screen
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailabe || audioAvailabe) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailabe, audio: audioAvailabe });

                if (userMediaStream) {

                    window.localStream = userMediaStream;

                    localVideoRef.current.srcObject = userMediaStream;

                }
            }

        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        getPermissions();
    }, [])

    const getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id == socketIdRef.current) continue;

            addTracksToPeer(connections[id], window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ "sdp": connections[id].localDescription }));
                }).catch(e => console.log(e));
            }).catch(e => console.log(e));
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            let blackSilence = (...args) => new MediaStream([black(...args, silence())]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                addTracksToPeer(connections[id], window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                    }).catch(e => console.log(e));
                }).catch(e => console.log(e));
            }
        })

    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), width, height);

        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    const getUserMedia = () => {
        if ((video && videoAvailabe) || (audio && audioAvailabe)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));

        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();

                tracks.forEach((track => track.stop()));
            } catch (error) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        if (video != undefined && audio != undefined) {
            getUserMedia();
        }
    }, [video, audio])

    let gotMessageFromServer = (fromId, message) => {
        let signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {

            if (signal.sdp) {

                connections[fromId]
                    .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {

                        if (signal.sdp.type === "offer") {

                            connections[fromId]
                                .createAnswer()
                                .then(answer => {

                                    connections[fromId]
                                        .setLocalDescription(answer)
                                        .then(() => {

                                            socketRef.current.emit(
                                                "signal",
                                                fromId,
                                                JSON.stringify({
                                                    sdp: connections[fromId].localDescription
                                                })
                                            );

                                        });

                                });
                        }

                    });

            }

            if (signal.ice) {

                connections[fromId]
                    .addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(e => console.log(e));

            }
        }
    };


    let addMessage = (data, sender, socketIdSender) => {

        setMessages(prevMessages => [...prevMessages, { sender: sender, data: data }]);
        if (socketIdSender !== socketIdRef.current) {
            if (!showModal) {

                setNewMessages((prev) => {
                    return prev + 1;
                });

            }
        }
    }

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {

            socketRef.current.emit('join-call', window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {

                setVideos((videos) =>
                    videos.filter((video) => video.socketId !== id)
                );

                videoRef.current = videoRef.current.filter(
                    (video) => video.socketId !== id
                );

                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }

            });

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].ontrack = (event) => {

                        const stream = event.streams[0];

                        setVideos(prev => {

                            const exists = prev.find(v => v.socketId === socketListId);

                            if (exists) {
                                return prev.map(v => v.socketId === socketListId ? { ...v, stream } : v);
                            }

                            return [...prev, { socketId: socketListId, stream }];
                        });
                    };

                    if (window.localStream != undefined && window.localStream != null) {

                        addTracksToPeer(connections[socketListId], window.localStream);

                    } else {

                        let blackSilence = (...args) => new MediaStream([black(...args, silence())]);
                        window.localStream = blackSilence();
                        addTracksToPeer(connections[id], window.localStream);

                    }

                    if (id == socketIdRef.current) {
                        for (let id2 in connections) {
                            if (id2 == socketIdRef.current) continue;

                            try {
                                addTracksToPeer(connections[id], window.localStream);
                            } catch (error) {
                                console.log(error);
                            }
                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                                    })
                                    .catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }
                })
            })
        })
    }


    let getMedia = () => {
        setVideo(videoAvailabe);
        setAudio(audioAvailabe);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    const handleVideo = () => {
        setVideo(!video);
    }

    const handleAudio = () => {
        setAudio(!audio);
    }

    const handleScreen = () => {
        setScreen(!screen);
    }

    const getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.log(error);
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id == socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify(connections[id].localDescription))
                    })
                    .catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            let blackSilence = (...args) => new MediaStream([black(...args, silence())]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    const getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch(e => console.log(e));
            }
        }
    }

    useEffect(() => {
        if (screen != undefined) {
            getDisplayMedia();
        }
    }, [screen])


    const sendMessage = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    }

    const handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            setVideo([]);
            connections = {};
            socketRef.current.disconnect();
        } catch (error) {
            console.log(error);
        }

        routeTo("/home");

    }

    const handleChat = () => {
        setShowModal(!showModal);
        setNewMessages(0);
    }


    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <div>
            {askForUsername === true ?
                <div className={styles.askForUsername}>

                    <div style={{ position: "absolute", left: 0, top: 0, borderRadius: "50px" }}>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>

                    <div>

                        <h1>Enter into Lobby</h1>
                        <br />
                        <TextField id="outlined-basic" value={username} label="Username" variant="outlined" onChange={e => setUsername(e.target.value)} />
                        &nbsp;
                        &nbsp;
                        <Button variant="contained" onClick={connect}>Connect</Button>

                    </div>

                </div>
                :
                <div className={styles.meetVideoContainer}>

                    {showModal === true ?

                        <div className={styles.chatRoom}>

                            <div className={styles.chatHeader}>
                                Chat
                            </div>

                            <div className={styles.chatMessages}>
                                {messages.length > 0 ? messages.map((item, index) => {

                                    const isMe = item.sender === username;

                                    return (
                                        <div
                                            key={index}
                                            className={`${styles.messageBubble} ${isMe ? styles.myMessage : styles.otherMessage}`}
                                        >
                                            {!isMe && (
                                                <div className={styles.senderName}>
                                                    @{item.sender}
                                                </div>
                                            )}
                                            {item.data}
                                        </div>
                                    );
                                }) : ( <div>No messages yet</div> )}

                                <div ref={chatEndRef}></div>

                            </div>

                            <div className={styles.chatInput}>
                                <TextField
                                    fullWidth
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    label="Message"
                                    variant="outlined"
                                    size="small"
                                />
                                <Button variant="contained" onClick={sendMessage}>
                                    Send
                                </Button>
                            </div>

                        </div>

                        :
                        <></>
                    }

                    <h3 style={{ color: "white", padding: "10px" }}>Video Meeting</h3>

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                            : <></>
                        }

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={handleChat} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video ref={localVideoRef} className={styles.meetUserVideo} autoPlay muted></video>

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