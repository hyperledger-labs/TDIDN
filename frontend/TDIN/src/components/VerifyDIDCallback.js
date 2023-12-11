import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'
import React from 'react'

const VerifyDIDCallback = () => {
    const navigate = useNavigate()

    React.useEffect(() => {
        (async function () {
            const params = new URLSearchParams(window.location.href.split('?')[1])
            const resp = await axios.post(`${process.env.REACT_APP_VERIFIER_URL}/verifyDID`, {
                did: params.get("did"),
                challange: params.get("challange"),
                signature: params.get("signature")
            })
            if (resp.data.status === "success") {
                localStorage.setItem("token", resp.data.token)
                navigate("/dashboard")
            }
            else {
                setTimeout(() => {
                    toast.error(resp.data.message)
                    navigate("/")
                }, 1000)

            }
        })()
    }, [])
}

export default VerifyDIDCallback
