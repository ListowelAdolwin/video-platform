import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo_final.png'
import { useSelector } from 'react-redux'
import { IoIosLogOut } from 'react-icons/io'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../redux/features/user/userSlice'

function HeaderNew () {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const res = await fetch(
      'https://video-platform-api.onrender.com/api/auth/logout'
    )
    const data = await res.json()
    if (data.ok) {
      console.log('Logout successful')
      dispatch(logoutUser())
      navigate('/')
    }
  }

  const { currentUser } = useSelector(state => state.user)

  return (
    <header className='mx-auto  mt-2 w-full max-w-screen-md bg-slate-700 py-3 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg'>
      <div className='px-4'>
        <div className='flex items-center justify-between'>
          <Link
            to='/'
          >
            <img className='rounded-lg h-10 w-16' src={logo} alt='' />
          </Link>

          {currentUser ? (
            <div className='flex items-center gap-1'>
              <span className='text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95'>
                Hi, {currentUser.username}
              </span>
              {currentUser?.isAdmin && (
                <Link
                  className='text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95'
                  to='/upload'
                >
                  Upload
                </Link>
              )}
              <button
                type='button'
                onClick={handleLogout}
                className='text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95'
              >
                <IoIosLogOut />
              </button>
            </div>
          ) : (
            <div className='flex items-center justify-end gap-3'>
              <Link
                className='text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95'
                to='/login'
              >
                Sign in
              </Link>
              <Link
                className='inline-flex items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm'
                to='/register'
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default HeaderNew
