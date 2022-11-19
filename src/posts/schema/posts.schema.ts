import { timeStamp } from "console";
import mongoose from "mongoose";

export const PostSchema = new mongoose.Schema({
    description: String,
    photo: {
        type: String,
        required: [true, 'please add photo']
    },
    title: {
        type: String,
        required: [true, 'please add title']
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }],
    tags: [String],
    comments: [{
        author: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        },
        text: String
    }],

}, {
    timestamps:true
})
