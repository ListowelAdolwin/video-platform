import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Video from '../components/Video'
import { useSelector } from 'react-redux'

export default function Home () {
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const user = useSelector(state => state.user.currentUser)
  useEffect(() => {
    const getVideos = async () => {
      try {
        const res = await fetch('https://video-platform-api.onrender.com/api/videos')
        const data = await res.json()
        console.log("Videos")
        console.log("Video data", data)
        setVideos(data.videos)
        setIsLoading(false)
      } catch (error) {
        console.log("Error occurred in the videos fetch")
        console.log(error)
      }
    }
    getVideos()
  }, [])

  const removeDeletedVideo = videoId => {
    setVideos(videos.filter(vid => vid._id !== videoId))
  }

  return (
    <div>
      {isLoading && (
        <div
          id='loading-overlay'
          class='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60'
        >
          <svg
            class='animate-spin h-8 w-8 text-white mr-3'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              class='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              stroke-width='4'
            ></circle>
            <path
              class='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>

          <span class='text-white text-2xl font-bold'>Loading videos...</span>
        </div>
      )}
      <div className='px-2 my-2 sm:px-10 sm:my-10'>
        {videos && videos.length > 0 && (
          <div className='grid w-full sm:grid-cols-2 xl:grid-cols-3 gap-6'>
            {videos.map(video => (
              <Video
                video={video}
                removeVideo={removeDeletedVideo}
                key={video._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
