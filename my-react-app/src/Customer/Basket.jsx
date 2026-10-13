import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect, useRef } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';

/*
  Palette reference:
  Rust      #A65A34  – primary actions, active states
  Rust dark #8B4A2A  – hover
  Cream     #F7F1E8  – page background
  Coffee    #3B2A20  – body text
  Sage      #8A9A5B  – secondary accents / success
  Add "Fraunces" (display) + "Inter" (body) to index.html if not already present:
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  NOTE ON COMBO SUPPORT:
  BasketResponse now returns either a `catalog` (single item) OR a `combo`
  (ComboResponse) + `comboItems` (List<BasketComboItemResponse>), where each
  combo item has its own `catalog`, `quantity`, and `modifierOptions`.
  This file treats each basket row as "combo" when `b.combo` is present,
  otherwise as a plain "catalog" row, and renders accordingly.

  A couple of assumptions were made since they weren't specified in the
  backend snippets provided:
  - ComboResponse exposes `comboName`, `combo_image`, and `combo_price`
    fields, mirroring CatalogResponse's naming. Adjust if the real field
    names differ.
  - Delete/removal now targets a basket row by `basketId` rather than
    `catalogId`, since combo rows don't have a top-level catalogId. If your
    delete endpoint is still catalog-scoped for non-combo rows, you'll want
    to branch that call based on `isCombo`.
*/

const Basket = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const didRun = useRef(false);
  const [basket, setBasket] = useState([]);
  const navigate =  useNavigate();
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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

  // Helper: build an S3 URL safely (works for either catalog or combo images)
  const buildImageUrl = (imageKey) => {
    if (!imageKey) return null;
    return `https://${bucket}.s3.${region}.amazonaws.com/${imageKey}`;
  };

  // Helper: get display name / image / unit price for a basket row,
  // whether it's a plain catalog item or a combo.
  const getRowMeta = (b) => {
    const isCombo = !!b.combo;
    if (isCombo) {
      return {
        isCombo,
        name: b.combo.comboName,
        image: buildImageUrl(b.combo.combo_image),
      };
    }
    return {
      isCombo,
      name: b.catalog?.catalogName,
      image: buildImageUrl(b.catalog?.catalog_image),
    };
  };

          
      const handleDeleteClick = (id) => {

        
        setShowDeleteConfirm(!showDeleteConfirm); 
        setDeleteId(id);

     };

     const goToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
        action: "CHECKOUT",
        
      }
    })
  }


  const goToRegister = () => {
    navigate("/register", {
      state: {
        from: location.pathname + location.search,
        action: "CHECKOUT",
      }
    })
  }

    
     
    
     const addTempBasketToBasket = async () => {
        
    let postData = []
    let newBasket = {}
      for (const basket of guestBasket) {
        newBasket = {
          basket_ID: null,
          userId: Number(user_ID),
          catalogId: basket.catalog ? basket.catalog.catalogId : null,
          comboId: basket.combo ? basket.combo.comboId : null,
          quantity: basket.quantity,
          subtotal: basket.subtotal
        }
         postData.push(newBasket);
      }

     
     
            try {
              
                const response = await axios.post(`${API_URL}/basket/batchBasket`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                
               
                console.log(response);
                console.log(postData);
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

     

  console.log("Basket: ", basket);
  console.log(guestBasket);
  const getAllBasketItems = async () => {
    try {
      if(!token) {
      setBasket(guestBasket);
      
      return;
      }
            const response = await axios.get(`${API_URL}/basket/users/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          const basketData = response.data;
          const sortedBasket = basketData.sort(
      (a, b) => a.basketId - b.basketId
    );

    
    setBasket(sortedBasket);
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

  useEffect(() => {
  if (didRun.current) return;
  didRun.current = true;

  const syncBasket = async () => {
    if (token && guestBasket.length > 0) {
      const success = await addTempBasketToBasket();
      if (success) {
        localStorage.removeItem('basket');  
        setGuestBasket([]);   
      }
    }

    await getAllBasketItems();
  };

  syncBasket();
}, []);

    const updateQuantity = async(basket_ID, quantity) => {
      try {
        if (quantity < 1) return; 
        if(!token) {
          console.log("Update temp basket quantity")
          const existingBasketIndex = guestBasket.findIndex(b =>
            (b.catalog && b.catalog.catalogId === basket_ID) ||
            (b.combo && b.combo.comboId === basket_ID)
          );
          if (existingBasketIndex !== -1) {
            const updatedBasket = [...guestBasket];
            const row = updatedBasket[existingBasketIndex];
            const unitPrice = row.catalog
              ? row.catalog.catalog_price
              : row.combo.combo_price;
            updatedBasket[existingBasketIndex] = {
                ...row,
                quantity: quantity,
                subtotal: unitPrice * quantity
            };
            setGuestBasket(updatedBasket);
            setBasket(updatedBasket);
            localStorage.setItem('basket', JSON.stringify(updatedBasket));
            }
          return;
        }
    
         

        const response = await axios.put(`${API_URL}/basket/${basket_ID}/quantity/${quantity}`, {}, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

         setBasket(prevBasket =>
  prevBasket.map(baskets =>
    baskets.basketId === basket_ID
      ? {
          ...baskets,
          quantity: response.data.quantity,
          subtotal: response.data.catalog
            ? response.data.catalog.catalog_price
            : response.data.combo?.combo_price
        }
      : baskets
  )

);
getAllBasketItems();
        }
        catch (error) {
          if (error.response?.status === 404) {
            // Row no longer exists server-side (e.g. already deleted in
            // another tab/click, or a stale render). Drop it locally and
            // resync instead of surfacing a generic error.
            console.log("Basket row not found, dropping stale row and resyncing", basket_ID);
            setBasket(prev => prev.filter(b => b.basketId !== basket_ID));
            getAllBasketItems();
            return;
          }
          console.log("Failed to updateQuantity")
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
        }
      }
      
      const total = basket.reduce((sum, baskets) => sum + baskets.subtotal, 0);
        
      const deleteBasketItem = async() => {

        if(!token) {
           const updatedBasket = guestBasket.filter(b =>
             (b.catalog?.catalogId ?? b.combo?.comboId) !== deleteId
           );
          setGuestBasket(updatedBasket);          
          setBasket(updatedBasket);        
          localStorage.setItem('basket', JSON.stringify(updatedBasket));
          setShowDeleteConfirm(false);
          return;
        }
        setShowDeleteConfirm(false);
        try{
          // deleteId is now the row's basketId, which works for both
          // catalog items and combos.
          const response = await axios.delete(`${API_URL}/basket/${deleteId}`, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         
        getAllBasketItems();
        setDeleteId(0);
        } catch (error) {
          if (error.response?.status === 404) {
            // Already deleted server-side — just resync and move on.
            console.log("Basket row already deleted, resyncing", deleteId);
            getAllBasketItems();
            setDeleteId(0);
            return;
          }
          console.log("Failed to delete");
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
        }
      }

      const goToCheckout = () => {
        if(!token) {
          setShowLoginPopup(true);
          return;
      }
      if (basket == 0) {
        window.alert("Please add items to basket first");
      } else {
        navigate(`/checkout/${user_ID}`);
      }

      }
    



  return (
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />

      <section className="py-8 antialiased md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-[#3B2A20] sm:text-3xl">
            Shopping Cart
          </h2>
          <div className="mt-2 h-1 w-14 rounded-full bg-[#A65A34]"></div>

          {isLoading && token && (
            <div className="flex items-center justify-center my-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
            </div>
          )}

          <div className="mt-8 sm:mt-10 md:gap-6 lg:flex lg:items-start xl:gap-8">
            <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
              <div className="space-y-4">
                {!isLoading && basket.length == 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8C9B2] bg-white/60 py-16 text-center">
                    <svg className="mb-4 h-14 w-14 text-[#A65A34]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">Your basket is empty</p>
                    <p className="mt-1 text-sm text-[#8A7862]">Add something delicious to get started.</p>
                    <Link to="/browse" className="mt-5 rounded-full bg-[#A65A34] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8B4A2A]">
                      Browse the menu
                    </Link>
                  </div>
                )}

                {!token && basket.length == 0 && null}

                {showLoginPopup && (
                  <div className="fixed inset-0 z-[99] flex items-center justify-center bg-[#3B2A20]/50">
                    <div className="w-full max-w-xs rounded-xl bg-white px-6 py-6 text-[#3B2A20] shadow-xl">

                      <h2 className="text-center font-['Fraunces',serif] text-base font-semibold">
                        Login required
                      </h2>

                      <p className="mt-1 mb-4 text-center text-sm text-[#8A7862]">
                        Please log in or create an account before checking out
                      </p>

                      <div className="space-y-2">
                        <button
                          onClick={() => goToLogin()}
                          className="w-full cursor-pointer rounded-md bg-[#A65A34] py-2 text-sm font-medium text-white transition hover:bg-[#8B4A2A]"
                        >
                          Log in
                        </button>

                        <button
                          onClick={() => goToRegister()}
                          className="w-full cursor-pointer rounded-md border border-[#A65A34] py-2 text-sm text-[#A65A34] transition hover:bg-[#A65A34]/10"
                        >
                          Create account
                        </button>
                      </div>

                      <button
                        onClick={() => setShowLoginPopup(false)}
                        className="mt-3 w-full cursor-pointer text-xs text-[#8A7862] hover:text-[#3B2A20]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {basket.map(b => {
                  const { isCombo, name, image } = getRowMeta(b);
                  const rowKey = b.basketId ?? b.catalog?.catalogId ?? b.combo?.comboId;
                  // For non-combo rows we keep using catalogId for
                  // qty/delete calls when logged out (guest basket has no
                  // basketId yet); for combos we use comboId instead.
                  const guestRowId = b.catalog?.catalogId ?? b.combo?.comboId;
                  const qtyTargetId = token ? b.basketId : guestRowId;
                  const deleteTargetId = token ? b.basketId : guestRowId;

                  return (
                  <div key={rowKey} className="rounded-xl border border-[#E7DCC9] bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
                    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                      <a href="#" className="shrink-0 md:order-1">
                        {image ? (
                          <img className="h-20 w-20 rounded-lg border border-[#F0E7D8] object-cover" src={image} alt={name} />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[#F0E7D8] bg-[#FBF6EE] text-xs text-[#8A7862]">
                            No image
                          </div>
                        )}
                      </a>

                      <label htmlFor="counter-input" className="sr-only">Choose quantity:</label>
                      <div className="flex items-center justify-between md:order-3 md:justify-end">
                        <div className="flex items-center rounded-lg border border-[#E7DCC9] bg-[#FBF6EE]">
                          <button onClick={() => updateQuantity(qtyTargetId, b.quantity - 1)} type="button" id="decrement-button" className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-l-lg text-[#A65A34] transition hover:bg-[#A65A34]/10">
                            <svg className="h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
                            </svg>
                          </button>
                          <input type="text" value={b.quantity} id="counter-input" readOnly className="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-[#3B2A20] focus:outline-none focus:ring-0" />
                          <button onClick={() => updateQuantity(qtyTargetId, b.quantity + 1)} type="button" id="increment-button" className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-r-lg text-[#A65A34] transition hover:bg-[#A65A34]/10">
                            <svg className="h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-end md:order-4 md:w-32">
                          <p className="text-base font-semibold text-[#3B2A20]">PHP {b.subtotal}</p>
                        </div>
                      </div>

                      <div className="w-full min-w-0 flex-1 space-y-3 md:order-2 md:max-w-md">
  <div className="flex items-center gap-2">
    <a href="#" className="font-['Fraunces',serif] text-base font-medium text-[#3B2A20] hover:text-[#A65A34]">{name}</a>
    {isCombo && (
      <span className="inline-flex items-center rounded-full bg-[#8A9A5B]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5F6D3E]">
        Combo
      </span>
    )}
  </div>

  {/* Combo sub-items: each with its own catalog item, quantity, and modifiers */}
  {isCombo && b.comboItems && b.comboItems.length > 0 && (
    <div className="space-y-2 rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] p-3">
      {b.comboItems.map(ci => (
        <div key={ci.comboItemId} className="text-sm">
          <div className="flex items-center justify-between text-[#3B2A20]">
            <span className="font-medium">
              {ci.quantity}x {ci.catalog?.catalogName}
            </span>
          </div>
          {ci.modifierOptions && ci.modifierOptions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ci.modifierOptions.map(m => (
                <span
                  key={m.modifierOptionId}
                  className="inline-flex items-center rounded-full border border-[#E7DCC9] bg-white px-2 py-0.5 text-xs text-[#6B5745]"
                >
                  {m.name}
                  {Number(m.priceAdjustment) > 0 && (
                    <span className="ml-1 text-[#A65A34]">+PHP {Number(m.priceAdjustment).toFixed(2)}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {/* Selected modifier options for a plain (non-combo) line item */}
  {!isCombo && b.modifierOptions && b.modifierOptions.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {b.modifierOptions.map(m => (
        <span
          key={m.modifierOptionId}
          className="inline-flex items-center rounded-full border border-[#E7DCC9] bg-[#FBF6EE] px-2.5 py-0.5 text-xs text-[#6B5745]"
        >
          {m.name}
          {Number(m.priceAdjustment) > 0 && (
            <span className="ml-1 text-[#A65A34]">+PHP {Number(m.priceAdjustment).toFixed(2)}</span>
          )}
        </span>
      ))}
    </div>
  )}

  {/* Special instructions for this line item */}
  {b.specialInstructions && (
    <p className="text-xs italic text-[#8A7862]">
      <span className="font-medium not-italic text-[#6B5745]">Note: </span>
      {b.specialInstructions}
    </p>
  )}

  <div className="flex items-center gap-4">
    <button onClick={() => handleDeleteClick(deleteTargetId)} type="button" className="inline-flex cursor-pointer items-center text-sm font-medium text-red-600 hover:underline">
      <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
      </svg>
      Remove
    </button>
  </div>
</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 rounded-xl border border-[#E7DCC9] bg-white p-4 shadow-sm sm:p-6">
                <p className="font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Order summary</p>

                <div className="space-y-4">
                  <dl className="flex items-center justify-between gap-4 border-t border-[#E7DCC9] pt-3">
                    <dt className="text-base font-semibold text-[#3B2A20]">Total</dt>
                    <dd className="text-base font-semibold text-[#A65A34]">PHP {total}</dd>
                  </dl>
                </div>

                <button onClick={goToCheckout} className="flex w-full items-center justify-center cursor-pointer rounded-lg bg-[#A65A34] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B4A2A] focus:outline-none focus:ring-4 focus:ring-[#A65A34]/30">
                  Proceed to Checkout
                </button>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-normal text-[#8A7862]"> or </span>
                  <Link to="/browse" title="" className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#A65A34] underline hover:no-underline">
                    Continue Shopping
                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                    </svg>
                  </Link>
                </div>
              </div>

              {showRateLimitPopup && (
                <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getAllBasketItems} currentPage={currentPage} />
              )}

              {showDeleteConfirm && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center bg-[#3B2A20]/50">
                  <div className="w-full max-w-xs rounded-xl bg-white px-6 py-6 text-center text-[#3B2A20] shadow-xl">

                    <h2 className="mb-2 font-['Fraunces',serif] text-base font-semibold">Confirm Delete</h2>
                    <p className="mb-4 text-sm text-[#8A7862]">
                      Are you sure you want to remove this item from basket
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={deleteBasketItem}
                        className="w-full cursor-pointer rounded-md bg-[#A65A34] py-2 text-sm font-medium text-white transition hover:bg-[#8B4A2A]"
                      >
                        Yes, Delete
                      </button>

                      <button
                        onClick={handleDeleteClick}
                        className="w-full cursor-pointer rounded-md border border-[#A65A34] py-2 text-sm text-[#A65A34] transition hover:bg-[#A65A34]/10"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Basket