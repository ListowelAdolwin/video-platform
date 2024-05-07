import Video from "../models/Video.mjs";

export const saveVideo = async (req, res) => {
	const {
		title, description, videoUrl, poster,
	} = req.body;

	if (!title || !description || !videoUrl) {
		return res
			.status(400)
			.json({ ok: false, msg: "Please fill in all fields" });
	}

	try {
		const lastVideo = await Video.findOne().sort({ createdAt: -1 });
		const newVideo = await Video.create({
			title,
			description,
			videoUrl,
			poster,
			nextVid: lastVideo ? lastVideo._id : null,
		});
		if (lastVideo) {
			await Video.findByIdAndUpdate(lastVideo._id, {
				prevVid: newVideo._id,
			});
		}

		return res.status(201).json({
			ok: true,
			msg: "Video saved successfully",
			video: newVideo,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ ok: false, msg: "Error saving video" });
	}
};

export const getVideos = async (req, res) => {
	const startIndex = req.query.startIndex || 0;
	const limit = req.query.limit || 9;
	try {
		const videos = await Video.find()
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip(startIndex);
		res.status(200).json({
			ok: true,
			msg: "Videos fetched successfully",
			videos,
		});
	} catch (error) {
		res.status(500).json({ ok: false, msg: "Error getting video" });
		console.log(error);
	}
};

export const getVideo = async (req, res) => {
	const { id } = req.params;
	try {
		const projection = { username: 1 };
		const video = await Video.findById(id).populate("poster", projection);
		if (!video) {
			return res.status(404).json({ ok: false, msg: "Video not found" });
		}
		return res.status(200).json({ ok: true, msg: "Videos fetched successfully", video });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ ok: false, msg: "Error getting video" });
	}
};

export const getNextVideo = async (req, res) => {
	const { id } = req.params;

	try {
		const vid = await Video.findById(id);
		const { nextVid } = vid;
		res.json({ ok: true, msg: "Videos fetched successfully", nextVid });
	} catch (error) {
		res.status(500).json({ ok: false, msg: "Error getting video" });
		console.log(error);
	}
};

export const deleteVideo = async (req, res) => {
	const { id } = req.params;

	try {
		const video = await Video.findById(id);
		if (!video) {
			return res.status(404).json({ msg: "Video not found", ok: false });
		}
		const prevVid = await Video.findById(video.prevVid);
		const nextVid = await Video.findById(video.nextVid);

		if (prevVid) {
			prevVid.nextVid = nextVid?.id || null;
			await prevVid.save();
		}

		if (nextVid) {
			nextVid.prevVid = prevVid?.id || null;
			await nextVid.save();
		}

		await Video.findByIdAndDelete(id);
		return res.status(200).json({ msg: "Video deleted", ok: true });
	} catch (error) {
		console.log("Error in video deletion: ", error);
		return res.status(500).json({ msg: "Could not delete video", ok: false });
	}
};

export const editVideo = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).json({ msg: "Video not found", ok: false });
	}

	try {
		const updatedVideo = await Video.findByIdAndUpdate(
			id,
			{
				$set: req.body,
			},
			{ new: true },
		);

		return res.status(200).json({
			msg: "Video edited successfully!",
			ok: true,
			video: updatedVideo,
		});
	} catch (error) {
		console.log("Edit video error: ", error);
		return res.json({ msg: "Could not edit video" });
	}
};
