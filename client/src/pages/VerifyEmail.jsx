import React from 'react'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VerifyEmail() {
    const params = useParams()
    const token = params.token

    useEffect(() => {
        verifyEmail()
    }, [])

    const verifyEmail = async () => {
        const res = await fetch(`/api/auth/verify-email/${token}`)
        const data = await res.json()
        console.log(data)
        if (data.ok) {
            toast("Email successfuly verified")
        } else {
            toast(data.msg)
        }
    }

  return (
    <div>
      <ToastContainer />
    </div>
  );
}

export default VerifyEmail