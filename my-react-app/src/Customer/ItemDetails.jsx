import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect, useRef } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';
import ModifierSelector from '../components/ModifierSelector';
import ItemReviews from '../components/ItemReviews';

const ItemDetails = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const region = import.meta.env.VITE_AWS_REGION;
    const param = useParams();
    const [item, setItem] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [quantity, setQuantity] = useState(1);
    const customer = localStorage.getItem('username');
    const [showPopup, setShowPopup] = useState(false);
    const [retryTime, setRetryTime] = useState(0);
    const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
    const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const hasResumedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    // Modifier groups fetched from the real endpoint (null until loaded)
    const [modifiers, setModifiers] = useState(null);
    const [isModifiersLoading, setIsModifiersLoading] = useState(false);
    // Modifier selections: { [modifierGroupId]: number[] (selected modifierOptionIds) }
    const [selections, setSelections] = useState({});
    const [modifierError, setModifierError] = useState("");
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    // Free-text special instructions for the kitchen (e.g. "no onions", "extra spicy")
    const [specialInstructions, setSpecialInstructions] = useState("");
    const SPECIAL_INSTRUCTIONS_MAX_LENGTH = 200;
    const [guestBasket, setGuestBasket] = useState(() => {
        try {
    const basketString = localStorage.getItem('basket');
    if (!basketString || basketString === "undefined") {
      return [];
    }
    return JSON.parse(basketString);
  } catch (err) {
    console.warn("Invalid basket in localStorage, resetting to empty array", err);
    return [];
  }
    })

      useEffect(() => {
    if (location.state?.popup) {
     
      setShowLoginSuccessPopup(true);
  
      setTimeout(() => setShowLoginSuccessPopup(false), 3000);
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('basket', JSON.stringify(guestBasket));
    }, [guestBasket])


    const fetchCatalogByCategory = async () => {

      let id = param.id;

      if(!param.id) {
        id = location.state?.catalogId;
      }
          try {
            const response = await axios.get(`${API_URL}/catalog/${id}`, {
              headers: {
                       
                        'Content-Type': 'application/json'
                    }});

          console.log(response);
          setItem(response.data);
          setIsLoading(false);
          } catch (error) {
            console.error(error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          
          }
        }

    useEffect(() => {
        fetchCatalogByCategory();
    }, [param.id]);


    console.log("Item", item)

    // Real fetch, same endpoint/pattern as ItemCard's fetchModifiersByItem
    const fetchModifiersByItem = async () => {
      let id = param.id;
      if(!param.id) {
        id = location.state?.catalogId;
      }
      setIsModifiersLoading(true);
      try {
        const response = await axios.get(`${API_URL}/modifierGroup/modifier-groups/catalog/${id}`, {
          headers: {
            'Authorization' : `Bearer ${token}`,
            'Content-Type': 'application/json'
          }});
        setModifiers(response.data);
      } catch (error) {
        console.error("Error");
        if (error.response?.data === "Too many requests" || error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
          setRetryTime(retryAfter);
          setError("Too Many Requests");
          setShowRateLimitPopup(true);
        }
      } finally {
        setIsModifiersLoading(false);
      }
    }

    const openModifierModal = () => {
      setSelections({});
      setModifierError("");
      setSpecialInstructions("");
      fetchModifiersByItem();
      setIsModifierModalOpen(true);
    };

    // Flattens { groupId: [optionId, ...] } into a single array of selected option ids
    const getSelectedOptionIds = () => Object.values(selections).flat();

    // Sums priceAdjustment across every currently-selected option
    const getModifierPriceAdjustment = () => {
      if (!modifiers) return 0;
      const selectedIds = new Set(getSelectedOptionIds());
      let total = 0;
      for (const group of modifiers) {
        for (const option of group.modifierOptions || []) {
          if (selectedIds.has(option.modifierOptionId)) {
            total += Number(option.priceAdjustment) || 0;
          }
        }
      }
      return total;
    };

    // Returns null if every required modifier group has enough selections, otherwise an error message
    const validateModifierSelections = () => {
      if (!modifiers) return null;
      for (const group of modifiers) {
        if (!group.required) continue;
        const count = (selections[group.modifierGroupId] || []).length;
        if (count < group.minSelections) {
          return `Please select at least ${group.minSelections} option${group.minSelections === 1 ? "" : "s"} for "${group.name}".`;
        }
      }
      return null;
    };

    const unitPrice = (item.catalog_price || 0) + getModifierPriceAdjustment();


     const addToBasket = async (event, overrideQty) => {
        if (event) event.preventDefault();

        const validationMessage = validateModifierSelections();
        if (validationMessage) {
          setModifierError(validationMessage);
          return;
        }
        setModifierError("");

        let postData = {}
        

        let id = param.id;
        let finalQty = quantity;

      if(!param.id) {
        id = location.state?.catalogId;
        
      }

      if(overrideQty) finalQty = overrideQty;

      const selectedModifierOptionIds = getSelectedOptionIds();
      const trimmedInstructions = specialInstructions.trim();
      // Two basket lines only merge if they're the exact same catalog item, same modifier combo, AND same instructions
      const sameModifiers = (a) =>
        JSON.stringify([...(a || [])].sort()) === JSON.stringify([...selectedModifierOptionIds].sort());

      if(!token) {
        const existingCatalogIndex = guestBasket.findIndex(
          b => b.catalog.catalogId === Number(id)
            && sameModifiers(b.selectedModifierOptionIds)
            && (b.specialInstructions || "") === trimmedInstructions
        );

          if(existingCatalogIndex !== -1) {
           
             const updatedBasket = [...guestBasket];
            const updatedQuantity = updatedBasket[existingCatalogIndex].quantity + finalQty;
            updatedBasket[existingCatalogIndex] = {
              ...updatedBasket[existingCatalogIndex],
              quantity: updatedQuantity,
              subtotal: unitPrice * updatedQuantity
            };
            setGuestBasket(updatedBasket);
          } else {
         postData = {
            basket_ID: null,
            customer: null,
            catalog: {
              catalogId: item.catalogId,
              catalogName: item.catalogName,
              catalog_price: item.catalog_price,
              catalog_description: item.catalog_description,
              catalog_image: item.catalog_image
            },
            quantity: finalQty,
            subtotal: unitPrice * finalQty,
            modifierOptionIds: selectedModifierOptionIds,
            specialInstructions: trimmedInstructions
        }

        setGuestBasket([...guestBasket, postData]);
      }
        setShowPopup(true);
        setSelections({});
        setQuantity(1);
        setSpecialInstructions("");
        setIsModifierModalOpen(false);
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

       postData = {
        basket_ID: null,
        customer: null,
        catalog: null,
        quantity: finalQty,
        subtotal: unitPrice * finalQty,
        modifierOptionIds: selectedModifierOptionIds,
        specialInstructions: trimmedInstructions
    }

   
      
            try {
              
                const response = await axios.post(`${API_URL}/basket/users/${user_ID}/catalog/${id}`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);

                setQuantity(1);
                setSelections({});
                setSpecialInstructions("");
                setIsModifierModalOpen(false);
                
               
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

        const addToQuantity = () => {

          setQuantity(quantity + 1);

        }


        const minusFromQuantity =  () => {

          setQuantity(quantity - 1);

        }

        useEffect(() => {
        if (
          location.state?.action === "ADD_TO_BASKET" &&
          !hasResumedRef.current
        ) {
          hasResumedRef.current = true;

          addToBasket(null, location.state?.quantity);
          navigate(location.pathname, { replace: true });
        }
      }, []);
console.log(location.state?.quantity);
  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col">
  <Header />
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
        <div className="fixed top-5 right-5 z-[99] flex w-full max-w-xs p-4" role="alert">
          <div className="flex w-full items-center rounded-lg bg-[#3B2A20] p-4 text-white shadow-lg">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#8A9A5B]/20 text-[#B7C68C]">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">Item added to basket.</div>
          </div>
        </div>
      )}


     
{isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
            </div>
    )}
  <div className="flex-1 flex items-center justify-center px-4">

    
    <div className="max-w-5xl w-full p-8 lg:p-16 bg-white rounded-2xl shadow-lg border border-[#E7DCC9] mt-5 mb-10">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        
        <div className="w-full">
          <img
            src={`https://${bucket}.s3.${region}.amazonaws.com/${item.catalog_image}`}
            alt={item.catalogName}
            className="w-full rounded-xl object-cover object-center shadow-md"
          />
        </div>

        
        <div className="w-full flex flex-col gap-6">
          <div>
            <span className="inline-block rounded-full bg-[#8A9A5B]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#5C6B3B]">
              Available now
            </span>
            <h1 className="mt-3 font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#3B2A20]">{item.catalogName}</h1>
          </div>
          <p className="text-[#6B5745] text-sm leading-relaxed">{item.catalog_description}</p>

          <h2 className="text-[#A65A34] text-2xl font-semibold">PHP {item.catalog_price}</h2>

          <hr className="border-[#E7DCC9] my-2" />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-[#FBF6EE] px-3 py-2 rounded-lg border border-[#E7DCC9]">
              <button onClick={minusFromQuantity} className="text-[#A65A34] px-2 cursor-pointer py-1 hover:bg-[#A65A34]/10 rounded">
                -
              </button>
              <span className="text-[#3B2A20] font-semibold text-lg w-6 text-center">{quantity}</span>
              <button onClick={addToQuantity} className="text-[#A65A34] cursor-pointer px-2 py-1 hover:bg-[#A65A34]/10 rounded">
                +
              </button>
            </div>

          <button
  onClick={openModifierModal}
  className="flex-1 min-w-[150px] px-6 py-2 cursor-pointer
             bg-[#A65A34]
             text-white font-medium rounded-lg
             transition-all duration-300 ease-out
             hover:bg-[#8B4A2A]
             hover:scale-[1.03]
             active:scale-[0.98]
             shadow-sm"
>
  Add to Basket
</button>


          </div>
        </div>
      </div>
    </div>
  </div>

    <ItemReviews catalogId={item.catalogId} />
  {/* Modifier picker modal: sticky header, scrollable body, sticky footer with live total — keeps the page itself from stretching */}
  {isModifierModalOpen && (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#3B2A20]/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

        <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-[#E7DCC9] px-6 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#3B2A20]">{item.catalogName}</h3>
            <p className="text-sm text-[#8A7862]">PHP {item.catalog_price} base price</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModifierModalOpen(false)}
            className="ms-3 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#3B2A20]/60 transition-colors duration-150 hover:bg-[#A65A34]/10 hover:text-[#3B2A20]"
          >
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isModifiersLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
            </div>
          )}
          {!isModifiersLoading && modifiers && modifiers.length === 0 && (
            <p className="text-sm text-[#8A7862]">No modifiers available for this item.</p>
          )}
          {!isModifiersLoading && modifiers && modifiers.length > 0 && (
            <ModifierSelector
              modifierGroups={modifiers}
              selections={selections}
              setSelections={setSelections}
            />
          )}
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
              <button onClick={minusFromQuantity} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">-</button>
              <span className="w-6 text-center text-lg font-semibold text-[#3B2A20]">{quantity}</span>
              <button onClick={addToQuantity} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">+</button>
            </div>
          </div>
          <button
            onClick={addToBasket}
            className="w-full cursor-pointer rounded-lg bg-[#A65A34] px-6 py-3 text-center text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[#8B4A2A] active:scale-[0.99]"
          >
            Add {quantity} to Basket · PHP {(unitPrice * quantity).toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  )}
</div>

  );
}

export default ItemDetails