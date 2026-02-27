import axios from "axios";
import { createContext, useContext } from "react";
import server from "../../environment";

const client = axios.create({
    baseURL: `${server}/api/v1/history`
})

export const HistoryContext = createContext({});


export function HistoryProvider({ children }) {

    const getUserHistory = async () => {
        try {
            let request = await client.get("/get_to_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            })

            return request.data;

        } catch (error) {
            throw error
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            })

            return request

        } catch (error) {
            throw error;
        }
    }

    const data = {
        getUserHistory, addToUserHistory
    }

    return (
        <div>
            <HistoryContext.Provider value={data}>
                {children}
            </HistoryContext.Provider>
        </div>
    )
}