import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from '@mui/icons-material/Restore';
import Button from "@mui/material/Button";

import "../App.css";
import TextField from "@mui/material/TextField";
import { HistoryContext } from "../context/HistoryContext";


function Home() {

    let router = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(HistoryContext);

    const handleJoinVideoCall = async () => {

        await addToUserHistory(meetingCode);

        router(`/meet/${meetingCode}`);

    }

    return (
        <div>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>Video Call</h2>

                </div>

                <div style={{ display: "flex", alignItems: "center" }}>

                    <IconButton onClick={() => {
                        router("/history");
                    }} >
                        <RestoreIcon />
                        <p>History</p>
                    </IconButton>

                    <Button variant="contained" onClick={() => {
                        localStorage.removeItem("token");
                        router("/auth");
                    }}>
                        Logout
                    </Button>

                </div>

            </div>

            <div className="homeContainer">

                <div className="leftPanel">
                    <div>

                        <h2>Providing Quality Video Call</h2>
                        <br />
                        <TextField onChange={(e) => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined"></TextField>
                        &nbsp;
                        &nbsp;
                        <Button onClick={handleJoinVideoCall} variant="contained">Join</Button>

                    </div>
                </div>

                <div className="rightPanel">
                    <img src="/logo.png" alt="logo" />
                </div>

            </div>

        </div>
    )
}

export default withAuth(Home);