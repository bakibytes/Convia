import httpStatus from "http-status";
import axios from "axios";
import { useCallback, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { useNavigate } from "react-router-dom";
import serverUrl from "../environment.js";

const client = axios.create({
    baseURL: `${serverUrl}/api/v1/user`,
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        const request = await client.post("/register", {
            name,
            username,
            password,
        });

        return request.data.message;
    };

    const handleLogin = async (username, password) => {
        const request = await client.post("/login", {
            username,
            password,
        });

        if (request.status === httpStatus.OK) {
            localStorage.setItem("token", request.data.token);
            setUserData(request.data.user ?? null);
            router("/home");
        }

        return request.data;
    };

    const getHistoryOfUser = useCallback(async () => {
        const request = await client.get("/get_all_activity", {
            params: {
                token: localStorage.getItem("token")
            }
        });
        return request.data;
    }, []);


    const addToUserHistory = useCallback(async (meetingCode) => {
        const request = await client.post("/add_to_activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode,
        });
        return request;
    }, []);

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        addToUserHistory,
        getHistoryOfUser
    };
    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
