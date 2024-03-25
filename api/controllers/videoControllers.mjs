import Video from "../models/Video.mjs";

export const saveVideo = async (req, res, next) => {
    const {title, description, videoUrl} = req.body
    console.log(req.body)

    if (!title || !description || !videoUrl) {
        return res.status(400).json({ok: false, msg: "Please fill in all fields"})
    }

    try {
        const lastVideo = await Video.findOne().sort({ createdAt: -1 })
        console.log("Last vid: ", lastVideo)
        const newVideo = await Video.create({
            title,
            description,
            videoUrl,
            prevVid: lastVideo ? lastVideo._id : null
        })
        if (lastVideo) {
            await Video.findByIdAndUpdate(lastVideo._id, {
            nextVid: newVideo._id,
      });
    }
        
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

export const getVideo = async (req, res) => {
    const id = req.params.id
    try {
        const video = await Video.findById(id)
        res.json({ok: true, msg: "Videos fetched successfully", video})
    } catch (error) {
        res.status(500).json({ok: false, msg: "Error getting video"})
        console.log(error)
    }
}

export const getNextVideo = async (req, res) => {
    const id = req.params.id
    
    console.log("Next vid: ", nextVid)
    try {
        const vid = await Video.findById(id)
        const nextVid = vid.nextVid
        res.json({ok: true, msg: "Videos fetched successfully", nextVid})
    } catch (error) {
        res.status(500).json({ok: false, msg: "Error getting video"})
        console.log(error)
    }
}


export const deleteVideo = async (req, res) => {
    const id = req.params.id;

    try {
        const video = await Video.findById(id)
        console.log("video: ", video)
        if (!video) {
            return res.status(404).json({msg: "Video not found", ok: false})
        }
        const prevVid = await Video.findById(video.prevVid)
        const nextVid = await Video.findById(video.nextVid)
        console.log("prev: ", prevVid)
        console.log("next: ", nextVid)
        if (prevVid){
            prevVid.nextVid = nextVid?.id || null
            await prevVid.save()
            }
        
        if (nextVid){
            nextVid.prevVid = prevVid?.id || null
            await nextVid.save()
        }
         
        await Video.findByIdAndDelete(id)
        res.status(200).json({msg: "Video deleted", ok:true})
        
    } catch (error) {
        console.log("Error in video deletion: ", error)
        return res.json({msg: "Could not delete video", ok: false})
    }
}