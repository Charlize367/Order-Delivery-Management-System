import React from 'react'
import { useState } from 'react'

// UI ONLY — no state, no logic, no handlers wired up yet.
// Swap the "selected" className manually per button until logic is added.

const TippingSelector = ({ setTip, tip }) => {
  const [other, setOther] = useState(false);
  


  const handleAmountChange = (e) => {
  const value = e.target.value;
  // allow empty, digits, and at most one decimal point with up to 2 places
  if (/^\d*\.?\d{0,2}$/.test(value)) {
    setTip(value);
  }
};

  return (
    <div className="mt-12">
      <h2 className="mb-2 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Add a tip</h2>
      <p className="mb-6 text-sm text-[#8A7862]">100% of your tip goes to your rider.</p>

      <div className="grid grid-cols-4 gap-3">
        {/* Tip option — inactive state */}
         <button
          type="button"
          onClick={() => {
            setTip(20.0)
            setOther(false)
          }}
          className={
            tip === 20.0
              ? "rounded-md border-2 border-[#A65A34] bg-[#FBF6EE] px-4 py-3 text-center transition-colors"
              : "rounded-md border-2 border-[#E7DCC9] bg-white px-4 py-3 text-center transition-colors hover:border-[#D9C9AE]"
          }
        >
          <p
            className={
              tip === 20.0
                ? "text-sm font-semibold text-[#A65A34]"
                : "text-sm font-semibold text-gray-700"
            }
          >
            PHP 20
          </p>
        </button>

        {/* Tip option — inactive state */}
        <button
        type="button"
        onClick={() => {
            setTip(50.0)
            setOther(false)
          }}
        className={
          tip === 50.0
            ? "rounded-md border-2 border-[#A65A34] bg-[#FBF6EE] px-4 py-3 text-center transition-colors"
            : "rounded-md border-2 border-[#E7DCC9] bg-white px-4 py-3 text-center transition-colors hover:border-[#D9C9AE]"
        }
      >
        <p
          className={
            tip === 50.0
              ? "text-sm font-semibold text-[#A65A34]"
              : "text-sm font-semibold text-gray-700"
          }
        >
          PHP 50
        </p>
      </button>

        {/* Tip option — SELECTED state (example) */}
        <button
          type="button"
          onClick={() => {
            setTip(100.0)
            setOther(false)
          }}
          className={
            tip === 100.0
              ? "rounded-md border-2 border-[#A65A34] bg-[#FBF6EE] px-4 py-3 text-center transition-colors"
              : "rounded-md border-2 border-[#E7DCC9] bg-white px-4 py-3 text-center transition-colors hover:border-[#D9C9AE]"
          }
        >
          <p
            className={
              tip === 100.0
                ? "text-sm font-semibold text-[#A65A34]"
                : "text-sm font-semibold text-gray-700"
            }
          >
            PHP 100
          </p>
        </button>

        {/* Tip option — inactive state */}
        <button
          type="button"
          onClick={() => {
            setOther(true);
            setTip(0.0);
          }}
          className={
            other
              ? "rounded-md border-2 border-[#A65A34] bg-[#FBF6EE] px-4 py-3 text-center transition-colors"
              : "rounded-md border-2 border-[#E7DCC9] bg-white px-4 py-3 text-center transition-colors hover:border-[#D9C9AE]"
          }
        >
          <p
            className={
              other
                ? "text-sm font-semibold text-[#A65A34]"
                : "text-sm font-semibold text-gray-700"
            }
          >
            Other
          </p>
        </button>
      </div>

      {/* Custom tip input — shown when "Other" is selected (static example for now) */}

    {other && 
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-[#3B2A20]">Custom amount</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A7862]">PHP</span>
          <input
            type="text"
             value={tip}
              onChange={handleAmountChange}
             inputMode="decimal"
              placeholder="0.00"
            className="block w-full rounded-lg border border-[#E7DCC9] bg-white p-2.5 pl-11 text-sm text-[#3B2A20] placeholder:text-[#8A7862] focus:border-[#A65A34] focus:ring-[#A65A34]"
          />
        </div>
      </div>
      }
    </div>
  )
}

export default TippingSelector