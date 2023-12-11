import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'

function Authentication() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false)

    React.useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard')
        }
    }, [])

    // handle submit
    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault();
            window.location.href = `${process.env.REACT_APP_WALLET_URL}/verifyDID?callback_url=${process.env.REACT_APP_TDIN_URL}/verifyDIDCallback`
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className='h-[100vh] flex justify-center items-center'>
                <div className='flex px-8 py-20 bg-[#FFFFFF] rounded-[16px]' style={{ boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)" }}>
                    <div className='flex items-center justify-center pr-12'>
                        <img width={"300px"} height={"300px"} src="https://imgs.search.brave.com/QLXIlnw2uQmh8W6-hF22UeTEv4tlKgumsMC1nhFpvZc/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc3F1YXJlc3Bh/Y2UtY2RuLmNvbS9j/b250ZW50L3YxLzYw/OWMwZGRmOTRiY2Mw/Mjc4YTdjYmRiNC8x/NjUyMTY2ODM3Njc4/LUw5NDNZVkZaS0hD/RFdaSjVRNzhML1dh/bGxldCtieSt3YWx0/Lmlk"></img>
                    </div>
                    <form>
                        <div className="text-3xl text-center text-[#111928] font-bold mb-5">Sign in with your wallet</div>
                        <div className="text-base text-center text-[#111928] font-normal mb-5">Connect with one of available wallets or create a new one.</div>
                        <div style={{ marginTop: "1rem" }}>
                            <button type="submit"
                                style={{
                                    border: "1px solid #1C64F2",
                                    borderRadius: "12px"
                                }}
                                className="flex w-full justify-center bg-[#1C64F2] py-2 px-4 text-base font-semibold text-[#FFFFFF] hover:bg-blue-700"
                                onClick={handleSubmit}
                            >Connect Wallet</button>
                        </div>
                        <hr style={{ width: "50%", marginLeft: "25%", borderColor: "#3F83F8", marginTop: "1rem" }} />
                        <div className="flex items-center justify-center" style={{ marginTop: "0.7rem" }}>
                            <div onClick={() => {
                                window.location.href = `${process.env.REACT_APP_WALLET_URL}`
                            }} className='text-xs font-semibold text-[#6B7280] mt-2 cursor-pointer'>
                                Create a new wallet
                            </div>
                        </div>
                    </form>
                </div >
            </div>
        </div>
    )
}

export default Authentication