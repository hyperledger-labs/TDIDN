import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'
import React from 'react'

const VerifySimCard = () => {
    const navigate = useNavigate()

    React.useEffect(() => {
        (async function () {
            try {
                const params = new URLSearchParams(window.location.href.split('?')[1])
                const resp = await axios.post(`${process.env.REACT_APP_VERIFIER_URL}/verifySimCard`, {
                    invitationUrl: params.get("invitation"),
                })
                navigate("/dashboard")
                if (resp.data.message === "Verified") {
                    toast.success(resp.data.message)
                }
                else {
                    toast.error(resp.data.message)
                }
            } catch (error) {
                setTimeout(() => {
                    toast.error(error)
                    navigate("/dashboard")
                }, 1000)
            }
        })()
    }, [])

    return (
        <>
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        </>
    )
}

export default VerifySimCard
