import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import RateLimitPopup from '../components/RateLimitPopup';
import ModifierSelector from '../components/ModifierSelector';

const ItemCard = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image, available}, guestBasket, setGuestBasket } ) => {
  const user_ID = localStorage.getItem('user_ID');
  const API_URL = import.meta.env.VITE_API_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const [showPopup, setShowPopup] = useState(false);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);

  

  // Availability check — treat undefined as available so existing items aren't hidden by default
  const isAvailable = available === undefined ? true : Boolean(available);

  // Self-contained hardcoded modifier modal state — nothing here depends on any other component
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [modifiers, setModifiers] = useState();
  const [modifierSelections, setModifierSelections] = useState({});
  const [modifierQuantity, setModifierQuantity] = useState(1);
  const [modifierError, setModifierError] = useState("");
  // Free-text special instructions for the kitchen (e.g. "no onions", "extra spicy")
  const [specialInstructions, setSpecialInstructions] = useState("");
  const SPECIAL_INSTRUCTIONS_MAX_LENGTH = 200;

  useEffect(() => {
  const checkFavorite = async () => {
    if (!token || !user_ID) return;

    try {
      const response = await axios.get(
        `${API_URL}/favorites/catalog/${catalogId}?userId=${user_ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsFavorite(response.data);
    } catch (error) {
      console.error("Failed to check favorite:", error);
    }
  };

  checkFavorite();
}, [catalogId]);


  const toggleFavorite = async () => {
  try {
    if (isFavorite) {
      // Remove from favorites
      await axios.delete(
        `${API_URL}/favorites/catalog/${catalogId}?userId=${user_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsFavorite(false);

    } else {
    
      await axios.post(
        `${API_URL}/favorites/catalog/${catalogId}?userId=${user_ID}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsFavorite(true);
    }

  } catch (error) {
    console.error(error);
  }
};


  const fetchModifiersByItem = async () => {
          try {
            const response = await axios.get(`${API_URL}/modifierGroup/modifier-groups/catalog/${catalogId}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setModifiers(response.data);
            setIsLoading(false);

          } catch (error) {
            console.error("Error");
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);

          }
          }
        }

  const openModifierModal = () => {
    if (!isAvailable) return;

    setModifierSelections({});
    setModifierQuantity(1);
    setModifierError("");
    setSpecialInstructions("");

    fetchModifiersByItem();
    setIsModifierModalOpen(true);
  };

  const closeModifierModal = () => {
    setIsModifierModalOpen(false);
    setModifierSelections({});
    setModifierError("");
    setSpecialInstructions("");
  };

  console.log("Modifier selections: ", modifierSelections);
  // Sums priceAdjustment across every currently-selected option
  const getModifierPriceAdjustment = () => {

    if(modifiers == null) {
      return;
    }

    // each group has stored option id
    const selectedIds = new Set(Object.values(modifierSelections).flat());
    let total = 0;
    // access modifier group
    for (const group of modifiers) {
      // access modifier options group
      for (const option of group.modifierOptions || []) {
        //check the option with its id that matches one of the ids in selectedIds
        if (selectedIds.has(option.modifierOptionId)) {
          // add to total calculated modifier price
          total += Number(option.priceAdjustment) || 0;
        }
      }
    }
    return total;
  };

  const validateModifierSelections = () => {
    // go through modifiers
    for (const group of modifiers) {
      //stop if this is not required
      if (!group.required) continue;
      // get the selected option (from selectedIds) from modifiers using its groupId
      const count = (modifierSelections[group.modifierGroupId] || []).length;
      //for required options
      //based on the selected modifier group, the count should return warning if a required group doesn't have anything selected
      if (count < group.minSelections) {
        return `Please select at least ${group.minSelections} option${group.minSelections === 1 ? "" : "s"} for "${group.name}".`;
      }
    }
    return null;
  };

  const modifierUnitPrice = catalog_price + getModifierPriceAdjustment();

    const addToBasket = async (event) => {
        if (event) event.preventDefault();

        if (!isAvailable) return;

        let postData = {}

        const modifierOptionIds = Object.values(modifierSelections).flat();
        const trimmedInstructions = specialInstructions.trim();

        // ADD AS GUEST USER
        if(!token) {

          setGuestBasket(prevBasket => {
    const existingCatalogIndex = prevBasket.findIndex(
      b => b.catalog.catalogId === catalogId
        && JSON.stringify([...(b.modifierOptionIds || [])].sort()) === JSON.stringify([...modifierOptionIds].sort())
        && (b.specialInstructions || "") === trimmedInstructions
    );

    if (existingCatalogIndex !== -1) {
        const updatedBasket = [...prevBasket];
        const updatedQuantity = updatedBasket[existingCatalogIndex].quantity + modifierQuantity;
        updatedBasket[existingCatalogIndex] = {
            ...updatedBasket[existingCatalogIndex],
            quantity: updatedQuantity,
            subtotal: (updatedBasket[existingCatalogIndex].catalog.catalog_price  + getModifierPriceAdjustment()) * updatedQuantity,
            modifierOptionIds: modifierOptionIds
        };
        return updatedBasket;

   
    } else {
        const postData = {
            basket_ID: null,
            customer: null,
            catalog: { catalogId, catalogName, catalog_price, catalog_description, catalog_image },
            quantity: modifierQuantity,
            subtotal: (modifierUnitPrice * modifierQuantity).toFixed(2),
            modifierOptionIds: modifierOptionIds,
            specialInstructions: trimmedInstructions
        };
        return [...prevBasket, postData];
    }
});

 // ADD AS AUTHENTICATED USER
        setShowPopup(true);

        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

     postData = {
        basket_ID: null,
        customer: null,
        catalog: null,
        quantity: modifierQuantity,
        subtotal: (modifierUnitPrice * modifierQuantity).toFixed(2),
        modifierOptionIds: modifierOptionIds,
        specialInstructions: trimmedInstructions
    }

            try {

                const response = await axios.post(`${API_URL}/basket/users/${user_ID}/catalog/${catalogId}`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

                setTimeout(() => setShowPopup(false), 3000);

                console.log(response);
                return true;

            } catch (error) {
                console.error('Failed to add to cart:', error);
                if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);

          }
                return false;

              }


        }

  // TEMP: not wired into addToBasket's payload yet (that still posts flat quantity/subtotal) —
  // this just validates the hardcoded selections, then triggers the existing add flow and closes.
  const confirmAddFromModal = () => {
    const validationMessage = validateModifierSelections();
    if (validationMessage) {
      setModifierError(validationMessage);
      return;
    }
    addToBasket();
    closeModifierModal();
  };

  useEffect(() => {
    if(location.state?.action === "ADD_TO_BASKET") {
      if (isAvailable) {
        addToBasket(null);
      }
      location.state.action = null;

    }
  }, [location.state])

  return (
    <div className="itemCard group relative block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-[#A65A34]/10">

      {showRateLimitPopup && (
        <RateLimitPopup
          error={error}
          retryTime={retryTime}
          setRetryTime={setRetryTime}
          setShowPopup={setShowRateLimitPopup}
          showPopup={showRateLimitPopup}
        />
      )}

      {showPopup && (
        <div className="fixed top-5 right-5 flex w-full max-w-xs p-4 text-[#3B2A20] bg-none rounded-lg z-50" role="alert">
          <div className="flex items-center w-full p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg">
            <div className="inline-flex items-center justify-center w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">Item added to basket.</div>
          </div>
        </div>
      )}

      {showLoginPopup && (
         <div className="fixed inset-0 z-99 flex items-center justify-center bg-[#3B2A20]/50 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl bg-[#F7F1E8] px-6 py-5 text-[#3B2A20] shadow-2xl border border-[#A65A34]/15">

        <h2 className="text-center text-base font-semibold">
          Login required
        </h2>

        <p className="mt-1 mb-4 text-center text-sm text-[#3B2A20]/60">
          Please log in or create an account to add items to your cart
        </p>

        <div className="space-y-2">
          <button
            onClick={() => goToLogin()}
            className="w-full cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] py-2.5 text-sm font-medium text-[#F7F1E8] transition-colors duration-150 shadow-sm hover:shadow-md"
          >
            Log in
          </button>

          <button
            onClick={() => goToRegister()}
            className="w-full cursor-pointer rounded-lg border border-[#A65A34]/30 py-2.5 text-sm text-[#3B2A20] hover:bg-[#A65A34]/10 transition-colors duration-150"
          >
            Create account
          </button>
        </div>

        <button
          onClick={() => setShowLoginPopup(false)}
          className="mt-3 w-full cursor-pointer text-xs text-[#3B2A20]/50 hover:text-[#3B2A20]"
        >
          Cancel
        </button>
      </div>
    </div>
      )}


      <Link to={`/food_details/${catalogId}`} className="relative block">
        <img
          src={`https://${bucket}.s3.${region}.amazonaws.com/${catalog_image}`}
          alt={catalogName}
          className={`h-50 w-full object-cover transition-transform duration-500 sm:h-60 ${
            isAvailable ? 'group-hover:scale-105' : 'blur-sm scale-105'
          }`}
        />

        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#3B2A20]/30">
            <span className="rounded-full bg-[#3B2A20]/80 text-[#F7F1E8] text-xs font-semibold px-3 py-1 shadow-sm">
              Currently Unavailable
            </span>
          </div>
        )}
      </Link>

      <button
  type="button"
  onClick={() => toggleFavorite()}
  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  aria-pressed={isFavorite}
  className={`absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-sm transition-colors duration-150 ${
    isFavorite
      ? 'bg-[#A65A34] text-white hover:bg-[#8A4A2A]'
      : 'bg-white/90 text-[#A65A34] hover:bg-white'
  }`}
>
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill={isFavorite ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
    />
  </svg>
</button>


      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#3B2A20]">{catalogName}</h3>
        <p className="mt-1.5 text-sm font-medium text-[#A65A34]">PHP {catalog_price}</p>


        <div className="mt-4 flex gap-3">

          <Link to={`/food_details/${catalogId}`} className="flex-1">
            <button className="w-full rounded-lg cursor-pointer bg-[#A65A34] text-[#F7F1E8] p-3 text-sm font-semibold transition-colors duration-150 hover:bg-[#8A4A2A] shadow-sm hover:shadow-md">
              View More
            </button>
          </Link>


          <button
  type="button"
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    openModifierModal();
  }}
  disabled={!isAvailable}
  className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors duration-150 ${
    isAvailable
      ? 'cursor-pointer border-[#A65A34] text-[#A65A34] hover:bg-[#A65A34] hover:text-[#F7F1E8]'
      : 'cursor-not-allowed border-[#A65A34]/30 text-[#A65A34]/40'
  }`}
>
  {isAvailable ? 'Add to Basket' : 'Unavailable'}
</button>

        </div>

      </div>

      {/* TEMP: hardcoded modifier modal, self-contained to this card — same sticky header/scrollable body/sticky footer pattern used elsewhere */}
      {isModifierModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3B2A20]/40 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

            <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-[#E7DCC9] px-6 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#3B2A20]">{catalogName}</h3>
                <p className="text-sm text-[#8A7862]">PHP {catalog_price} base price</p>
              </div>
              <button
                type="button"
                onClick={closeModifierModal}
                className="ms-3 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#3B2A20]/60 transition-colors duration-150 hover:bg-[#A65A34]/10 hover:text-[#3B2A20]"
              >
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <ModifierSelector
                modifierGroups={modifiers}
                selections={modifierSelections}
                setSelections={setModifierSelections}
              />
              {modifierError && (
                <p className="mt-3 text-sm text-red-600">{modifierError}</p>
              )}

              {/* Special instructions */}
              <div className="mt-5 border-t border-[#E7DCC9] pt-5">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="special_instructions" className="text-sm font-medium text-[#3B2A20]">
                    Special instructions
                  </label>
                  <span className="text-xs text-[#8A7862]">
                    {specialInstructions.length}/{SPECIAL_INSTRUCTIONS_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  id="special_instructions"
                  name="special_instructions"
                  rows="3"
                  maxLength={SPECIAL_INSTRUCTIONS_MAX_LENGTH}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. no onions, extra spicy, allergic to peanuts"
                  className="w-full resize-none rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] p-3 text-sm text-[#3B2A20] placeholder-[#8A7862]/60 focus:border-[#A65A34] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-[#E7DCC9] px-6 py-4">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] px-3 py-2">
                  <button onClick={() => setModifierQuantity(q => Math.max(1, q - 1))} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">-</button>
                  <span className="w-6 text-center text-lg font-semibold text-[#3B2A20]">{modifierQuantity}</span>
                  <button onClick={() => setModifierQuantity(q => q + 1)} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">+</button>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmAddFromModal}
                className="w-full cursor-pointer rounded-lg bg-[#A65A34] px-6 py-3 text-center text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[#8A4A2A] active:scale-[0.99]"
              >
                Add {modifierQuantity} to Basket · PHP {(modifierUnitPrice * modifierQuantity).toFixed(2)}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default ItemCard