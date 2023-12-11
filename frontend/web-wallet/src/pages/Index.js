import instance from '../AxiosInstance/authenticated'
import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

const Index = () => {
  const dispatch = useDispatch();

  const url = useSelector((state) => state.url.url);

  const [loading, setLoading] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [credentials, setCredentials] = React.useState([])

  React.useEffect(() => {
    (async function () {
      setLoading(true)
      if (url) {
        dispatch({ type: 'UPDATE_URL', payload: null })
        window.open(url, "_self")
        return
      }
      const resp = await instance.get("/")
      if (resp.data)
        setCredentials(resp.data)
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      {
        loading ?
          <>
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          </>
          :
          <>
            <div className="flex justify-between items-center bg-white py-4 px-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold ml-2">Web Wallet</h1>
              </div>
              <div className="flex items-center">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                  <svg className="fill-current w-4 h-4 mr-2" viewBox="0 0 20 20">
                    <path
                      id="refresh"
                      d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10c5.522 0 10-4.477 10-10S15.522 0 10 0zm4.707 10.707l-2.121 2.121A3.99 3.99 0 0 1 10 15a4 4 0 1 1 4-4c0 .552-.448 1-1 1a1 1 0 0 0 0 2c.552 0 1 .448 1 1a1 1 0 0 1-1 1h-1a1 1 0 0 0 0 2h1a3 3 0 0 0 2.586-4.414z"
                    />
                  </svg>
                  <span>Refresh</span>
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-2">
                  <svg className="fill-current w-4 h-4 mr-2" viewBox="0 0 20 20">
                    <path
                      id="bell"
                      d="M10 20a2 2 0 0 1-2-2H8a6 6 0 0 0 4.47-10.242A7 7 0 0 0 16 5V4a2 2 0 0 1 4 0v1a9 9 0 0 1-9 9zm0 0V4a4 4 0 0 0-8 0v1a8 8 0 0 0 16 0v-1a4 4 0 0 0-8 0v16a4 4 0 0 1-4 4 4 4 0 0 1-4-4z"
                    />
                  </svg>
                  <span>Notifications</span>
                </button>
                {/* Dropdown */}
                <div className="relative inline-block text-left ml-2">
                  <div>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                      <img
                        src="https://random.imagecdn.app/100/100"
                        alt="profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="ml-2">{localStorage.getItem("name")}</span>
                    </button>
                  </div>
                  {
                    dropdownOpen &&
                    <div className="absolute right-0 w-44 mt-2 origin-top-right bg-white rounded-md shadow-lg">
                      {/* Logout button */}
                      <button onClick={() => {
                        localStorage.removeItem("name")
                        localStorage.removeItem("email")
                        localStorage.removeItem("accessToken")
                        localStorage.removeItem("refreshToken")
                        window.location.href = "/signin"
                      }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >Logout</button>
                    </div>
                  }
                </div>
              </div>
            </div>
            <hr className="border-gray-300" />
            <div>
              {
                credentials.length > 0 ?
                  <div className='p-10'>
                    {
                      credentials.map((credential, index) => {
                        return (
                          <div className="flex gap-10 bg-white overflow-hidden shadow rounded-lg w-fit bg-gray-50" key={index}>
                            <div className="flex items-center px-5 py-10">
                              <img className="h-32 flex-shrink-0 mr-7" src="/images/Issuer.svg" alt="" />
                              <div>
                                {
                                  credential.map((item, index) => {
                                    return (
                                      <div className="flex gap-4">
                                        <span className="text-lg text-gray-400 w-[60px]">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
                                        :
                                        <span className="text-lg text-gray-500">{item.value}</span>
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  :
                  <div className="w-fit px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8 p-3 lg:p-0 mt-3">
                    <div className="text-center pt-6">
                      <svg aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"  >
                        <path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                      </svg>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No credentials yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started filling your wallet by receiving some credentials!</p>
                      <div className="mt-4">
                        <a href="https://issuer.walt.id" target="_blank" className="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="button">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>{" "}Request credentials{" "}
                        </a>
                      </div>
                    </div>
                  </div>
              }
            </div>
          </>
      }
    </div>
  )
}

export default Index
