import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import httpStatus from "http-status";


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        let user = await User.findOne({ token: token });
        let meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (error) {
        res.json({message: `something went wrong ${error}`})
    }
}

const addUserHistory = async (req, res)=>{
    const {token, meeting_code} = req.body;

    try {
        const user = await User.findOne({token: token});

        const newMeeting = new Meeting({
            user_id: user.username,
            meeting_code: meeting_code
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message: "Added code to History"})

    } catch (error) {
        res.json({message: `something went wrong ${error}`});
    }
}

export {getUserHistory, addUserHistory};