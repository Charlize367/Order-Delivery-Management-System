import React, { useEffect, useMemo, useState } from 'react';

// Hardcoded fallback — pass a `discounts` prop (e.g. fetched from the API)
// once the backend endpoint for promos is ready. Same shape either way.
// `minOrder` drives eligibility; omit it for promos with no minimum.
// const DEFAULT_DISCOUNT_OPTIONS = [
//   { id: 'save5', label: 'SAVE5', description: '5% off', type: 'percent', value: 5, minOrder: 0 },
//   { id: 'save10', label: 'SAVE10', description: '10% off', type: 'percent', value: 10, minOrder: 200 },
//   { id: 'save15', label: 'SAVE15', description: '15% off', type: 'percent', value: 15, minOrder: 500 },
//   { id: 'flat50', label: 'FLAT50', description: 'PHP 50 off', type: 'flat', value: 50, minOrder: 300 },
//   { id: 'flat100', label: 'FLAT100', description: 'PHP 100 off', type: 'flat', value: 100, minOrder: 600 },
//   { id: 'newuser', label: 'NEWUSER', description: '20% off, first order', type: 'percent', value: 20, minOrder: 0 },
//   { id: 'weekend', label: 'WEEKEND', description: '12% off', type: 'percent', value: 12, minOrder: 250 },
//   { id: 'birthday', label: 'BIRTHDAY', description: 'PHP 75 off', type: 'flat', value: 75, minOrder: 400 },
//   { id: 'loyalty', label: 'LOYALTY10', description: '10% off', type: 'percent', value: 10, minOrder: 0 },
//   { id: 'flash', label: 'FLASH25', description: '25% off', type: 'percent', value: 25, minOrder: 800 },
//   { id: 'referral', label: 'REFERRAL', description: 'PHP 60 off', type: 'flat', value: 60, minOrder: 300 },
// ];

const computeAmount = (option, subtotal) => {
  if (!option || option.discountType === 'none') return 0;
  if (option.discountType === 'PERCENTAGE') return (subtotal * option.discountValue) / 100;
  if (option.discountType === 'FLAT') return Math.min(option.discountValue, subtotal);
  return 0;
};

/**
 * DiscountSelector
 *
 * Collapsed summary row on the checkout page; tapping it opens a bottom
 * sheet with the full promo list. Best eligible promo auto-applies on
 * mount if nothing is selected yet.
 *
 * props:
 *  - subtotal: number — order subtotal, used for eligibility + amount math
 *  - discounts: array — available discount options (defaults to hardcoded list)
 *  - discount: { id, type, value } | null — currently selected discount (controlled)
 *  - setDiscount: (discount) => void — called with the selected option object (or null)
 */
const DiscountSelector = ({ subtotal = 0, discounts, discount, setDiscount }) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log("Promo Codes: ", discounts);
  console.log("Selected discount: ", discount);

  const enriched = useMemo(() => {
    return discounts
      .map((o) => ({
        ...o,
        eligible: subtotal >= (o.minimumOrderAmount ?? 0),
        amount: computeAmount(o, subtotal),
      }))
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.amount - a.amount;
      });
  }, [discounts, subtotal]);


  console.log(enriched);

  // Auto-apply the best eligible promo once, if nothing is selected yet.
  useEffect(() => {
    if (discount) return;
    const best = enriched.find((o) => o.eligible);
    if (best) setDiscount(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (option) => {
    setDiscount(option);
    setIsOpen(false);
  };

  const discountAmount = computeAmount(discount, subtotal);

  return (
    <div className="mt-10">
      <h2 className="mb-3 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Discount</h2>

      {/* Collapsed summary row */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-[#E7DCC9] bg-white px-4 py-3 text-left transition hover:border-[#D8C6AA]"
      >
        <div>
          {discount ? (
            <>
              <p className="text-sm font-medium text-[#3B2A20]">{discount.code}</p>
              {discountAmount > 0 && (
                <p className="text-xs text-[#A65A34]">- PHP {discountAmount.toFixed(2)} applied</p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#8A7862]">Select a promo</p>
          )}
        </div>
        <span className="text-sm font-medium text-[#A65A34]">{discount ? 'Change' : 'Select'}</span>
      </button>

      {/* Bottom sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-[#F7F1E8] sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DCC9] px-5 py-4">
              <h3 className="font-['Fraunces',serif] text-lg font-semibold text-[#3B2A20]">Promos</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-[#8A7862] hover:text-[#3B2A20]"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {discount && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="mb-3 w-full rounded-md border border-[#E7DCC9] bg-white px-3 py-2 text-left text-xs text-[#8A7862] hover:border-[#D8C6AA]"
                >
                  Remove applied promo
                </button>
              )}

              <div className="space-y-2">
                {enriched.map((option) => {
                  const isSelected = discount?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!option.eligible}
                      onClick={() => handleSelect(option)}
                      className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                        !option.eligible
                          ? 'cursor-not-allowed border-[#E7DCC9] bg-[#FBF6EE] opacity-50'
                          : isSelected
                          ? 'border-[#A65A34] bg-white'
                          : 'border-[#E7DCC9] bg-white hover:border-[#D8C6AA]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? 'border-[#A65A34]' : 'border-[#E7DCC9]'
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-[#A65A34]" />}
                      </span>
                      <div className="w-full">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-[#3B2A20]">{option.code}</p>
                          <p className="shrink-0 text-xs text-[#8A7862]">{option.description}</p>
                        </div>
                        {!option.eligible && (
                          <p className="mt-0.5 text-xs text-[#B5654A]">
                            Min. order PHP {option.minimumOrderAmount} to use this code
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSelector;