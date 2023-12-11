import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { handleSignIn, handleSignUp } from '../redux/actions/auth';

function Authentication() {
    // get current route
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname.slice(1)

    // state variables
    const [rememberState, setRememberState] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginData, setLoginData] = useState({
        name: '',
        email: "",
        password: ""
    })

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            navigate('/dashboard')
        }
    }, [])

    // handle Input
    let name, value;
    const handleInputs = (e) => {
        name = e.target.name;
        value = e.target.value;
        setLoginData({ ...loginData, [name]: value });
    }

    // handle submit
    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault();
            if (currentRoute === 'signup') {
                let res = await handleSignUp(loginData)
                if (res) {
                    navigate('/signin')
                } else {
                    dispatch({ type: 'CHANGE_ALERT_STATE', alerttype: 'failed', heading: "Something went wrong!" })
                }
            } else {
                let res = await handleSignIn(loginData)
                if (res) {
                    navigate('/dashboard')
                } else {
                    dispatch({ type: 'CHANGE_ALERT_STATE', alerttype: 'failed', heading: "Something went wrong!" })
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='grid min-h-screen place-items-center'>
            <div className='sm:max-w-sm xs:max-w-xm w-full' >
                {/* <p className='text-3xl text-center font-Inter font-[500] text-[#101828] ease-in duration-300'>🐿️ Dex</p> */}
                {/* <img src={logo} alt="logo" className='text-center w-20 mx-auto' /> */}
                <p className='text-3xl text-center font-Inter font-semibold text-[#101828] ease-in  duration-300 mt-2' >{currentRoute === 'signup' ? 'Create an account' : 'Log in to your account'}</p>
                <p className='font-Inter text-center text-[#101828] mt-1'>{currentRoute === 'signup' ? 'Start your SSI journey' : 'Welcome back! Please enter your details.'}</p>
                <form onSubmit={handleSubmit} className='px-7 sm:px-0'>
                    {
                        currentRoute === 'signup' && (
                            <div className="mt-5">
                                <label htmlFor="email" className="text-[#4E5674] font-[500] font-Inter">
                                    Name *
                                </label>
                                <div className="mb-4 mt-1 flex items-center rounded-lg border-2 py-2 px-3">
                                    <input className="border-none outline-none bg-transparent w-full font-Inter" type="text" name="name" id="text" onChange={handleInputs} placeholder="Enter your name" />
                                </div>
                            </div>
                        )
                    }
                    <div className="mt-5">
                        <label htmlFor="email" className="text-[#4E5674] font-[500] font-Inter">
                            Email *
                        </label>
                        <div className="mb-4 mt-1 flex items-center rounded-lg border-2 py-2 px-3">
                            <input className="border-none outline-none bg-transparent w-full font-Inter" type="text" name="email" id="email" onChange={handleInputs} placeholder="Enter your email" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password" className="text-[#4E5674] font-[500] font-Inter">
                            Password *
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border-2 py-2 px-3">
                            <input className="border-none outline-none bg-transparent w-full font-Inter" type="password" name="password" id="password" onChange={handleInputs} placeholder={currentRoute === 'signup' ? 'Create a password (min. 8 characters)' : 'Enter your Password'} />
                        </div>
                    </div>

                    {currentRoute === 'signup' ?
                        <div className="flex justify-start mt-6">
                            <input type="checkbox" className="w-3 h-3 mt-1 text-[#031927] bg-gray-100 accent-gray-100  " />
                            <p className="text-[##2970FF] font-Plus text-sm font-[500] ml-2" > I agree to the <a href="#" className='font-normal text-sm text-primary '>Terms & Conditions</a> </p>
                        </div>
                        :
                        <div className='flex mt-1'>
                            {/* <div className='flex justify-end item-center mt-0.5'>
                                <input type="checkbox" className="w-3 h-3 mt-1 text-[#031927] bg-gray-100 accent-gray-100 " checked={rememberState} onChange={(e) => { setRememberState(e.target.checked) }} />
                                <p className="text-[##2970FF] font-Plus select-none text-sm font-[500] ml-2" onClick={() => { setRememberState(!rememberState) }} >Remember for 30 days</p>
                            </div> */}
                        </div>
                    }

                    {
                        loading ?
                            <button disabled type="button" className="font-base mt-6 mb-2 block w-full rounded-lg bg-primary py-2.5 text-white">
                                <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                                Loading...
                            </button> :
                            <button type="submit"
                                className="font-semibold font-Inter text-sm mt-6 mb-2 block w-full rounded-lg transition duration-200 ease-in bg-primary hover:bg-primary py-2.5 text-white"
                            >
                                {
                                    currentRoute === 'signup' ?
                                        ' Sign up'
                                        :
                                        'Sign in'
                                }
                            </button>
                    }

                </form>
                {currentRoute === 'signup' ?
                    <p className='text-[#475467] font-Inter text-md text-center mt-6'>Already have an account?<Link className='text-primary ml-1 font-[500] font-Inter' to='/signin' replace>Login</Link></p>
                    :
                    <p className='text-[#475467] font-Inter text-md text-center mt-6'>Don’t have an account? <Link className='text-primary ml-1 font-[500] font-Inter' to='/signup' replace>Sign Up</Link></p>
                }
            </div>
        </div>
    )
}

export default Authentication