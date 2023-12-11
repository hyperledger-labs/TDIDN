import instance from '../AxiosInstance/authenticated'
import React from 'react'

const VerifyDID = () => {
    React.useEffect(() => {
        (async function () {
            const queryParameters = new URLSearchParams(new URL(window.location.href).search)
            const resp = await instance.get("/createInvitation")
            window.location.href = queryParameters.get("callback_url") + "?invitation=" + resp.data.invitation
        })()
    }, [])
}

export default VerifyDID
