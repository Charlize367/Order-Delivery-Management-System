import { useEffect  } from 'react'

const RateLimitPopup = ({error, retryTime, setRetryTime, setShowPopup, showPopup, fetchData, currentPage}) => {

    useEffect(() => {
                if (retryTime > 0) {
                  const timer = setInterval(() => setRetryTime((prev) => prev - 1), 1000);
                  return () => clearInterval(timer);
                } else if (retryTime === 0 && showPopup) {
                  setShowPopup(false); 
                }
              }, [retryTime, showPopup]);

  return (
    <div>
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black">
                <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
                    <h3 className="text-lg font-bold mb-2">{error}</h3>
                    <p>Please wait {retryTime} second{retryTime !== 1 ? "s" : ""} before trying again.</p>
                    <button
                    onClick={() => { setShowPopup(false); fetchData(currentPage); }}
                    disabled={retryTime > 0}
                    className={`text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center ${
                        retryTime > 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    >
                    Retry Now
                    </button>
                </div>
                </div>
        </div>
  )
}

export default RateLimitPopup