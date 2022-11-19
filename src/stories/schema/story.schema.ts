import mongoose from "mongoose";

export const StorySchema = new mongoose.Schema({
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    media: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date, 
        expires: '1d',
        default: Date.now
    }

})