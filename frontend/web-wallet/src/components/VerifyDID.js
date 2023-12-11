import instance from '../AxiosInstance/authenticated'
import React from 'react'

const VerifyDID = () => {
    React.useEffect(() => {
        (async function () {
            const queryParameters = new URLSearchParams(new URL(window.location.href).search)
            const resp = await instance.get("/sign")
            window.location.href = queryParameters.get("callback_url") + "?did=" + resp.data.did + "&challange=" + resp.data.challange + "&signature=" + resp.data.signature
        })()
    }, [])
}

export default VerifyDID
