import { Contract, BrowserProvider } from "ethers";
import abi from "../contracts/IMEI.json";
import { toast } from "sonner"
import axios from "axios";
import React from 'react'

const Index = () => {
  const [updateStatusModalVisibility, setUpdateStatusModalVisibility] = React.useState(false);
  const [verifyModalVisibility, setVerifyModalVisibility] = React.useState(false);
  const [status, setStatus] = React.useState(null);
  const [imei, setIMEI] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [account, setAccount] = React.useState(null);
  const [state, setState] = React.useState({
    provider: null,
    signer: null,
    contract: null,
  });

  React.useEffect(() => {
    const connectWallet = async () => {
      const contractABI = abi;
      try {
        const { ethereum } = window;

        if (ethereum) {
          const account = await ethereum.request({
            method: "eth_requestAccounts",
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          const provider = new BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const contract = new Contract(
            process.env.REACT_APP_IMEI_CONTRACT_ADDRESS,
            contractABI,
            signer
          );

          setAccount(account);
          setState({ provider, signer, contract });
        }
      } catch (error) {
        console.log(error);
      }
    };
    connectWallet();
  }, [])

  const updateIMEIStatus = async () => {
    try {
      const { contract } = state;
      if (!contract) {
        toast.error("Please connect your wallet");
        return;
      }

      setLoading(true)
      const result = await contract.getIMEIStatus(imei);
      if (result === "IMEI not found") {
        toast.error(result);
        return
      }
      else {
        if (result && result !== status) {
          const resp = await axios.post(`${process.env.REACT_APP_HOLDER_URL}/updateIMEIStatus`, { imei, status }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          if (resp.data.message === "Status updated successfully!") {
            toast.success(resp.data.message);
          }
          else {
            toast.error(resp.data.message);
          }
        }
        else if (result === status) {
          toast.success("IMEI status is already updated");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setStatus(null);
      setIMEI(null);
      setLoading(false)
    }
  }

  const queryIMEI = async () => {
    const { contract } = state;
    if (!contract) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const result = await contract.getIMEIStatus(imei);
      if (result === "IMEI not found") {
        toast.error(result);
      }
      else {
        toast.success(result);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIMEI(null);
    }
  }

  return (
    <>
      {
        loading &&
        <div
          tabIndex={-1}
          className="flex justify-center items-center fixed top-0 left-0 z-50 bg-[#00000080] w-full h-full overflow-auto"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
      <div>
        <nav className="bg-[#212529] text-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center justify-start w-full lg:flex-1">
                <img
                  className="h-8 w-auto sm:h-10"
                  src="https://tailwindui.com/img/logos/workflow-mark-white.svg"
                  alt=""
                />
                <div className="font-bold text-white ml-2">
                  Welcome to TDIN
                </div>
                <button className="font-medium text-white hover:text-gray-300 ml-auto" onClick={() => {
                  localStorage.removeItem('token')
                  window.location.href = '/'
                }}>
                  <svg
                    className="w-6 h-6 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center gap-10 mt-10 mx-5">
          <div class="max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src='/images/Issuer.svg' className='w-32 h-32' />
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Request Sim Card
            </h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
              Get your digital credential issued in your wallet.
            </p>
            <button onClick={() => {
              window.location.href = `${process.env.REACT_APP_WALLET_URL}/createInvitation?callback_url=${process.env.REACT_APP_TDIN_URL}/issueSimCard`
            }} class="inline-flex items-center text-blue-600 hover:underline">
              Issue to wallet
              <svg class="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
              </svg>
            </button>
          </div>
          <div class="max-w-lg p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src='/images/RegisterIMEI.svg' className='w-24 h-24 mb-4' />
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Request Device</h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
              Recieve a whitelisted IMEI number.
            </p>
            <button onClick={async () => {
              setLoading(true)

              try {
                const resp = await axios.get(`${process.env.REACT_APP_HOLDER_URL}/requestIMEI`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                })
                const element = document.createElement("a");
                const file = new Blob([resp.data], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = "IMEI.txt";
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
                element.remove();
              } catch (error) {
                toast.error(error.message)
              }

              setLoading(false)
            }} class="inline-flex items-center text-blue-600 hover:underline">
              Request IMEI number
              <svg class="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
              </svg>
            </button>
          </div>
          <div class="max-w-lg p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src='/images/UpdateInfo.svg' className='w-24 h-24 mb-4' />
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Update Device Status</h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
              Update your device status to prevent misuse.
            </p>
            <button onClick={() => { setUpdateStatusModalVisibility(true) }} class="inline-flex items-center text-blue-600 hover:underline">
              Update Status
              <svg class="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-10 my-10 mx-5">
          <div class="max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src='/images/VerifyCred.svg' className='w-24 h-24 mb-5' />
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Verify Operator</h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
              Verify if an operator has allotted the user a valid sim card and phone number.
            </p>
            <button class="inline-flex items-center text-blue-600 hover:underline" onClick={() => {
              window.location.href = `${process.env.REACT_APP_WALLET_URL}/createInvitation?callback_url=${process.env.REACT_APP_TDIN_URL}/verifySimCard`
            }}>
              Verify
              <svg class="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
              </svg>
            </button>
          </div>
          <div class="max-w-lg p-[26px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src='/images/PhoneVerify.svg' className='w-28 h-28' />
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Verify Device</h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
              Verify if a device has been reported stolen and is blacklisted by the owner.
            </p>
            <button onClick={() => { setVerifyModalVisibility(true) }} class="inline-flex items-center text-blue-600 hover:underline">
              Verify
              <svg class="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {
        updateStatusModalVisibility &&
        <div
          tabIndex={-1}
          className="flex justify-center items-center fixed top-0 left-0 z-50 bg-[#00000080] w-full h-full overflow-auto"
        >
          <div className='p-8 pr-4 pt-0 sm:mx-[23vw] sm:my-[7vh] bg-[#FFFFFF] rounded-[10px] w-[50%]' style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <div className="flex mt-4 mb-5 items-center">
              <div className="font-semibold text-3xl text-[#111928]">
                Update Device Status
              </div>
              <div className="cursor-pointer" style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                <svg onClick={() => { setUpdateStatusModalVisibility(false); }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                </svg>
              </div>
            </div>
            <input value={imei} onInput={(e) => { setIMEI(e.target?.value.trim()) }} className='mb-5 block w-[90%] text-base font-normal text-[#6B7280] py-[13px] px-[18px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px]' placeholder="Enter IMEI Number" />
            <select value={status} onChange={(e) => { setStatus(e.target.value) }} className='mb-5 block w-[90%] text-base font-normal text-[#6B7280] py-[13px] px-[18px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px]'>
              <option value={null}>Select Status</option>
              <option value="Whitelist">Whitelist</option>
              <option value="Blacklist">Blacklist</option>
            </select>
            <button className={`${imei && imei.length && status && status !== "Select Status" ? "ml-auto" : "ml-auto opacity-50 cursor-not-allowed disabled"}`}
              onClick={() => {
                setUpdateStatusModalVisibility(false);
                updateIMEIStatus();
              }} style={{ borderRadius: "12px", padding: "9px 10px 9px 10px", border: "1px solid #1C64F2", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1C64F2", width: "100px" }}>
              <svg className="mr-3" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7931 7.50003L12.9396 8.35358L8.65013 12.643C8.56064 12.737 8.51118 12.8622 8.51231 12.9921C8.51345 13.1232 8.56603 13.2486 8.65874 13.3413C8.75144 13.434 8.87685 13.4866 9.00794 13.4877C9.13783 13.4889 9.26301 13.4394 9.35703 13.3499L15.3534 7.35353C15.3534 7.35351 15.3534 7.35349 15.3534 7.35348C15.4471 7.25972 15.4998 7.13259 15.4998 7.00003C15.4998 6.86747 15.4471 6.74034 15.3534 6.64658L13.7931 7.50003ZM13.7931 7.50003H12.586H1C0.867392 7.50003 0.740215 7.44735 0.646446 7.35358C0.552678 7.25982 0.5 7.13264 0.5 7.00003C0.5 6.86742 0.552678 6.74025 0.646446 6.64648C0.740215 6.55271 0.867392 6.50003 1 6.50003H12.586H13.7931L12.9396 5.64648L8.64661 1.35353C8.64659 1.35351 8.64657 1.35349 8.64655 1.35348C8.55285 1.25972 8.50021 1.13259 8.50021 1.00003C8.50021 0.867498 8.55283 0.740391 8.6465 0.646637C8.74026 0.552902 8.86742 0.500244 9 0.500244C9.13256 0.500244 9.25969 0.552882 9.35345 0.646584C9.35346 0.646602 9.35348 0.646619 9.3535 0.646637L15.3534 6.64653L13.7931 7.50003Z" fill="white" stroke="white" />
              </svg>
              <div className="text-sm font-semibold text-[white] mb-0.5">Submit</div>
            </button>
          </div>
        </div>
      }
      {
        verifyModalVisibility &&
        <div
          tabIndex={-1}
          className="flex justify-center items-center fixed top-0 left-0 z-50 bg-[#00000080] w-full h-full overflow-auto"
        >
          <div className='p-8 pr-4 pt-0 sm:mx-[23vw] sm:my-[7vh] bg-[#FFFFFF] rounded-[10px] w-[50%]' style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <div className="flex my-4 items-center">
              <div className="font-semibold text-3xl text-[#111928]">
                Verify Device
              </div>
              <div className="cursor-pointer" style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                <svg onClick={() => { setVerifyModalVisibility(false); }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                </svg>
              </div>
            </div>
            <input value={imei} onInput={(e) => { setIMEI(e.target?.value.trim()) }} className='mb-5 block w-[90%] text-base font-normal text-[#6B7280] py-[13px] px-[18px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px]' placeholder="Enter IMEI Number" />
            <button className={`${imei && imei.length ? "ml-auto" : "ml-auto opacity-50 cursor-not-allowed disabled"}`}
              onClick={() => {
                setVerifyModalVisibility(false);
                queryIMEI();
              }} style={{ borderRadius: "12px", padding: "9px 10px 9px 10px", border: "1px solid #1C64F2", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1C64F2", width: "100px" }}>
              <svg className="mr-3" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7931 7.50003L12.9396 8.35358L8.65013 12.643C8.56064 12.737 8.51118 12.8622 8.51231 12.9921C8.51345 13.1232 8.56603 13.2486 8.65874 13.3413C8.75144 13.434 8.87685 13.4866 9.00794 13.4877C9.13783 13.4889 9.26301 13.4394 9.35703 13.3499L15.3534 7.35353C15.3534 7.35351 15.3534 7.35349 15.3534 7.35348C15.4471 7.25972 15.4998 7.13259 15.4998 7.00003C15.4998 6.86747 15.4471 6.74034 15.3534 6.64658L13.7931 7.50003ZM13.7931 7.50003H12.586H1C0.867392 7.50003 0.740215 7.44735 0.646446 7.35358C0.552678 7.25982 0.5 7.13264 0.5 7.00003C0.5 6.86742 0.552678 6.74025 0.646446 6.64648C0.740215 6.55271 0.867392 6.50003 1 6.50003H12.586H13.7931L12.9396 5.64648L8.64661 1.35353C8.64659 1.35351 8.64657 1.35349 8.64655 1.35348C8.55285 1.25972 8.50021 1.13259 8.50021 1.00003C8.50021 0.867498 8.55283 0.740391 8.6465 0.646637C8.74026 0.552902 8.86742 0.500244 9 0.500244C9.13256 0.500244 9.25969 0.552882 9.35345 0.646584C9.35346 0.646602 9.35348 0.646619 9.3535 0.646637L15.3534 6.64653L13.7931 7.50003Z" fill="white" stroke="white" />
              </svg>
              <div className="text-sm font-semibold text-[white] mb-0.5">Submit</div>
            </button>
          </div>
        </div>
      }
    </>
  )
}

export default Index
