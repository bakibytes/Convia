import { model, Schema } from "mongoose";

const meetingSchema = Schema({
    user_id: {
        type: String,
    },
    meetingCode: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});


const Meeting = model("Meeting", meetingSchema);

export { Meeting }