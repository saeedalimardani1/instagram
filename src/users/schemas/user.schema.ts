import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    username:{
      type: String,
      unique: true,
      required: true,
    },
    password:{ 
        type: String,
        required: true,
    },
    nickname: String,
    description: String,
    photo: String,
    age: Number,
    status: {
        type: String,
        enum: ['Public', 'Private'],
        default: 'Public'
    },
    
    followRequests: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref:'User'
    }],

    followingRequests: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref:'User'
    }],

    savedPosts: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Post'
    }],
    followers:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }],
    following:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }],
  },{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
    timestamps: true
  });

  UserSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
  })

  UserSchema.virtual('stories', {
    ref: 'Story',
    localField: '_id',
    foreignField: 'author'
  })