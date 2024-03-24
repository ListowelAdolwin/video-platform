import Video from "../models/Video.mjs";

export const saveVideo = async (req, res, next) => {
    const {title, description, videoUrl} = req.body
    console.log(req.body)

    if (!title || !description || !videoUrl) {
        return res.status(400).json({ok: false, msg: "Please fill in all fields"})
    }

    try {
        const newVideo = await Video.create({
            title,
            description,
            videoUrl
        })
        res.status(201).json({ok: true, msg: "Video saved successfully", video: newVideo})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok: false, msg: "Error saving video"})
    }
}


export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find()
        res.json({ok: true, msg: "Videos fetched successfully", videos})
    } catch (error) {
        res.status(500).json({ok: false, msg: "Error getting video"})
        console.log(error)
    }
}