import { useContext, useEffect, useState } from "react"
import { HistoryContext } from "../context/HistoryContext"
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/home";


import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function History() {
    const { getUserHistory } = useContext(HistoryContext);

    const [meetings, setMeetings] = useState([]);

    const router = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {

                let history = await getUserHistory();
                setMeetings(history);

            } catch (error) {
                console.log(error);
            }
        }

        fetchHistory();

    }, [])


    return (
        <div>
            <div style={{ position: "absolute", left: 0, padding: "10px", width: "100%", backgroundColor: "rgb(227, 227, 217)" }}>

                <IconButton onClick={() => {
                    router("/home")
                }}
                    size="large"
                >
                    <HomeIcon fontSize="inherit" />
                </IconButton>

                {meetings.length > 0 ?
                    meetings.map((item, index) => {
                        return (
                            <div key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 18, mb: 1.5 }}>
                                            Meeting Code: {item.meeting_code}
                                        </Typography>

                                        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                            Date: {item.date}
                                        </Typography>

                                    </CardContent>
                                </Card>
                            </div>
                        )
                    })
                    :
                    <></>
                }
            </div>

        </div>
    )
}
