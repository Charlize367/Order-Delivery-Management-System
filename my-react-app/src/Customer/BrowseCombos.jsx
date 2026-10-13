import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Header from '../components/CustomerHeader.jsx'
import RateLimitPopup from '../components/RateLimitPopup.jsx';
import ModifierSelector from '../components/ModifierSelector';

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const BrowseCombos = ({ guestBasket = [], setGuestBasket = () => {} }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const user_ID = localStorage.getItem('user_ID');
  const token = localStorage.getItem('jwtToken');

  const [combos, setCombos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

  // Added-to-basket toast
  const [showAddedPopup, setShowAddedPopup] = useState(false);

  // Modifier modal state — mirrors ItemCard, but keyed per combo item (by catalogId)
  // since a combo can bundle several catalog items, each with its own modifier groups.
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [itemModifiers, setItemModifiers] = useState({}); // { [catalogId]: modifierGroup[] }
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [modifierSelections, setModifierSelections] = useState({}); // { [catalogId]: { [groupId]: optionId[] } }
  const [comboQuantity, setComboQuantity] = useState(1);
  const [modifierError, setModifierError] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const SPECIAL_INSTRUCTIONS_MAX_LENGTH = 200;

  const fetchCombos = async () => {
    try {
      const response = await axios.get(`${API_URL}/combos`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setCombos((response.data || []).filter((c) => c.active));
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
  }

  useEffect(() => {
    fetchCombos();
  }, []);

  // Fetch modifier groups for every catalog item inside the combo, keyed by catalogId
  const fetchComboModifiers = async (combo) => {
    setLoadingModifiers(true);
    try {
      const results = await Promise.all(
        (combo.comboItems || []).map((it) =>
          axios
            .get(`${API_URL}/modifierGroup/modifier-groups/catalog/${it.catalog?.catalogId}`, {
              headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                'Content-Type': 'application/json'
              }
            })
            .then((res) => ({ catalogId: it.catalog?.catalogId, groups: res.data || [] }))
            .catch((err) => {
              console.error(err);
              if (err.response?.data === "Too many requests" || err.response?.status === 429) {
                const retryAfter = parseInt(err.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
              }
              return { catalogId: it.catalog?.catalogId, groups: [] };
            })
        )
      );

      const map = {};
      results.forEach(({ catalogId, groups }) => {
        map[catalogId] = groups;
      });
      setItemModifiers(map);
    } finally {
      setLoadingModifiers(false);
    }
  };

  const openModifierModal = (combo) => {
    setSelectedCombo(combo);
    setModifierSelections({});
    setComboQuantity(1);
    setModifierError("");
    setSpecialInstructions("");
    setItemModifiers({});
    fetchComboModifiers(combo);
    setIsModifierModalOpen(true);
  };

  const closeModifierModal = () => {
    setIsModifierModalOpen(false);
    setSelectedCombo(null);
    setModifierSelections({});
    setModifierError("");
    setSpecialInstructions("");
    setItemModifiers({});
  };

  // Wrapper so ModifierSelector (which expects a plain setSelections for one item)
  // can be reused per catalogId without colliding with other items' selections.
  const setSelectionsForCatalog = (catalogId) => (updater) => {
    setModifierSelections((prev) => {
      const current = prev[catalogId] || {};
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [catalogId]: next };
    });
  };

  const getItemPriceAdjustment = (catalogId) => {
    const groups = itemModifiers[catalogId] || [];
    const selectedIds = new Set(Object.values(modifierSelections[catalogId] || {}).flat());
    let total = 0;
    for (const group of groups) {
      for (const option of group.modifierOptions || []) {
        if (selectedIds.has(option.modifierOptionId)) {
          total += Number(option.priceAdjustment) || 0;
        }
      }
    }
    return total;
  };

  const getTotalModifierAdjustment = () => {
    if (!selectedCombo) return 0;
    return (selectedCombo.comboItems || []).reduce(
      (sum, it) => sum + getItemPriceAdjustment(it.catalog?.catalogId),
      0
    );
  };

  const modifierUnitPrice = selectedCombo
    ? Number(selectedCombo.bundlePrice || 0) + getTotalModifierAdjustment()
    : 0;

  const validateModifierSelections = () => {
    for (const it of selectedCombo?.comboItems || []) {
      const groups = itemModifiers[it.catalog?.catalogId] || [];
      for (const group of groups) {
        if (!group.required) continue;
        const count = (modifierSelections[it.catalog?.catalogId]?.[group.modifierGroupId] || []).length;
        if (count < group.minSelections) {
          return `Please select at least ${group.minSelections} option${group.minSelections === 1 ? "" : "s"} for "${group.name}" (${it.catalog?.catalogName}).`;
        }
      }
    }
    return null;
  };

  // Builds the ComboItemBasketRequest[] to match the backend record shape:
  // { catalogId, quantity, modifierOptionIds }
  const buildItemSelections = () =>
    (selectedCombo?.comboItems || []).map((it) => ({
      catalogId: it.catalog?.catalogId,
      quantity: it.quantity,
      modifierOptionIds: Object.values(modifierSelections[it.catalog?.catalogId] || {}).flat()
    }));

  const confirmAddComboToBasket = async () => {
    const validationMessage = validateModifierSelections();
    if (validationMessage) {
      setModifierError(validationMessage);
      return;
    }
    setModifierError("");

    const trimmedInstructions = specialInstructions.trim();
    const itemSelections = buildItemSelections();

    // GUEST USER — stash locally, same spirit as ItemCard's guestBasket entries
    if (!token) {
      setGuestBasket((prevBasket) => {
        const comboEntry = {
          basket_ID: null,
          customer: null,
          combo: {
            comboId: selectedCombo.comboId,
            name: selectedCombo.name,
            bundlePrice: selectedCombo.bundlePrice
          },
          quantity: comboQuantity,
          subtotal: (modifierUnitPrice * comboQuantity).toFixed(2),
          itemSelections,
          specialInstructions: trimmedInstructions
        };
        return [...(prevBasket || []), comboEntry];
      });

      setShowAddedPopup(true);
      setTimeout(() => setShowAddedPopup(false), 3000);
      closeModifierModal();
      return;
    }

    // AUTHENTICATED USER — matches ComboBasketRequest exactly
    const postData = {
      comboId: selectedCombo.comboId,
      quantity: comboQuantity,
      itemSelections,
      specialInstructions: trimmedInstructions
    };

    try {
      await axios.post(
        `${API_URL}/basket/users/${user_ID}/combo/${selectedCombo.comboId}`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowAddedPopup(true);
      setTimeout(() => setShowAddedPopup(false), 3000);
      closeModifierModal();
    } catch (error) {
      console.error('Failed to add combo to cart:', error);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
  };

  return (
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4">
        <span className="inline-block rounded-full bg-[#A65A34]/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-[#A65A34]">
          Bundle &amp; save
        </span>
        <h1 className="mt-3 font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">
          Combos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#8A7862] sm:text-base">
          A few of our favorite pairings, bundled up and priced to make ordering easy.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCombos} />
        )}

        {showAddedPopup && (
          <div className="fixed top-5 right-5 flex w-full max-w-xs p-4 text-[#3B2A20] bg-none rounded-lg z-50" role="alert">
            <div className="flex items-center w-full p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg">
              <div className="inline-flex items-center justify-center w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
              </div>
              <div className="ms-3 text-sm font-normal">Combo added to basket.</div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center my-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
          </div>
        )}

        {!isLoading && combos.length === 0 && (
          <p className="flex justify-center py-10 text-lg text-[#8A7862]">There are no combos available right now.</p>
        )}

        {!isLoading && combos.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => {
              const individualTotal = (combo.comboItems || []).reduce(
                (sum, it) => sum + (it.catalog?.price ?? 0) * it.quantity,
                0
              );
              const savings = individualTotal - Number(combo.bundlePrice || 0);

              return (
                <li
                  key={combo.comboId}
                  className="relative overflow-hidden rounded-2xl border border-[#A65A34]/15 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md flex flex-col"
                >
                  <div className="h-2 bg-gradient-to-r from-[#A65A34] to-[#8A9A5B]"></div>

                  <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#A65A34]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#A65A34]">
                        Combo
                      </span>
                      {savings > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[#8A9A5B]/15 px-2.5 py-1 text-[11px] font-semibold text-[#5D6B3D]">
                          Save {currency(savings)}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20] leading-snug">
                      {combo.name}
                    </h3>

                    {combo.description && (
                      <p className="mt-1 text-sm text-[#8A7862] leading-relaxed">
                        {combo.description}
                      </p>
                    )}

                    <ul className="mt-4 space-y-1.5 flex-1">
                      {(combo.comboItems || []).map((it) => (
                        <li key={it.comboItemId} className="flex items-center gap-1.5 text-sm text-[#3B2A20]/70">
                          <span className="h-1 w-1 rounded-full bg-[#A65A34]/50"></span>
                          <span className="truncate">{it.quantity}× {it.catalog?.catalogName}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xl font-bold text-[#3B2A20]">{currency(combo.bundlePrice)}</span>
                      <button
                        type="button"
                        onClick={() => openModifierModal(combo)}
                        className="cursor-pointer rounded-full bg-[#A65A34] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8B4A2A]"
                      >
                        Add to basket
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      </div>

      {/* Combo modifier modal — same sticky header/scrollable body/sticky footer pattern as ItemCard,
          but iterates every item in the combo and namespaces selections by catalogId. */}
      {isModifierModalOpen && selectedCombo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3B2A20]/40 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

            <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-[#E7DCC9] px-6 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#3B2A20]">{selectedCombo.name}</h3>
                <p className="text-sm text-[#8A7862]">{currency(selectedCombo.bundlePrice)} base price</p>
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
              {loadingModifiers && (
                <div className="flex items-center justify-center py-6">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
                </div>
              )}

              {!loadingModifiers && (selectedCombo.comboItems || []).map((it) => {
                const catalogId = it.catalog?.catalogId;
                const groups = itemModifiers[catalogId] || [];
                return (
                  <div key={it.comboItemId} className="mb-6 border-b border-[#E7DCC9] pb-5 last:border-b-0 last:pb-0">
                    <h4 className="mb-2 text-sm font-semibold text-[#3B2A20]">
                      {it.quantity}× {it.catalog?.catalogName}
                    </h4>
                    {groups.length > 0 ? (
                      <ModifierSelector
                        modifierGroups={groups}
                        selections={modifierSelections[catalogId] || {}}
                        setSelections={setSelectionsForCatalog(catalogId)}
                      />
                    ) : (
                      <p className="text-xs text-[#8A7862]">No customizations for this item.</p>
                    )}
                  </div>
                );
              })}

              {modifierError && (
                <p className="mt-1 text-sm text-red-600">{modifierError}</p>
              )}

              {/* Special instructions apply to the whole combo */}
              <div className="mt-5 border-t border-[#E7DCC9] pt-5">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="combo_special_instructions" className="text-sm font-medium text-[#3B2A20]">
                    Special instructions
                  </label>
                  <span className="text-xs text-[#8A7862]">
                    {specialInstructions.length}/{SPECIAL_INSTRUCTIONS_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  id="combo_special_instructions"
                  name="combo_special_instructions"
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
                  <button onClick={() => setComboQuantity(q => Math.max(1, q - 1))} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">-</button>
                  <span className="w-6 text-center text-lg font-semibold text-[#3B2A20]">{comboQuantity}</span>
                  <button onClick={() => setComboQuantity(q => q + 1)} className="cursor-pointer rounded px-2 py-1 text-[#A65A34] hover:bg-[#A65A34]/10">+</button>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmAddComboToBasket}
                className="w-full cursor-pointer rounded-lg bg-[#A65A34] px-6 py-3 text-center text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[#8A4A2A] active:scale-[0.99]"
              >
                Add {comboQuantity} to Basket · {currency(modifierUnitPrice * comboQuantity)}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default BrowseCombos