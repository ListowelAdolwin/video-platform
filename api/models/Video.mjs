import mongoose from 'mongoose'


const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    poster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    nextVid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    },
    prevVid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    }
    
}, {timestamps: true})

const Video = mongoose.model('Video', videoSchema)

export default Video
