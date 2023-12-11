import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'
import React from 'react'

const IssueSimCard = () => {
    const navigate = useNavigate()

    React.useEffect(() => {
        (async function () {
            try {
                const params = new URLSearchParams(window.location.href.split('?')[1])
                const resp = await axios.post(`${process.env.REACT_APP_ISSUER_URL}/issue`, {
                    invitationUrl: params.get("invitation"),
                })
                navigate("/dashboard")
                toast.success(resp.data.message)
            } catch (error) {
                setTimeout(() => {
                    toast.error(error)
                    navigate("/dashboard")
                }, 1000)
            }
        })()
    }, [])
}

export default IssueSimCard
