import crypto from "node:crypto";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import {Meeting} from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Please provide username and password" });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid username or password" });
        }

        const token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();

        return res.status(httpStatus.OK).json({ token });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${error.message || error}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Please provide name, username, and password" });
    }

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res
                .status(httpStatus.CONFLICT)
                .json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User Registered" });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${error.message || error}` });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        if (!token) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Authentication token is required" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid authentication token" });
        }

        const meetings = await Meeting.find({ user_id: user.username }).sort({ date: -1 });
        return res.status(httpStatus.OK).json(meetings);
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Failed to load meeting history: ${error.message || error}` });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        if (!token) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Authentication token is required" });
        }

        if (typeof meeting_code !== "string" || !meeting_code.trim()) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: "Meeting code is required" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid authentication token" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code.trim()
        });


        await newMeeting.save();

        return res
            .status(httpStatus.CREATED)
            .json({ message: "Added code to history", meeting: newMeeting });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Failed to save meeting history: ${error.message || error}` });
    }
}

export { login, register , getUserHistory , addToHistory };
