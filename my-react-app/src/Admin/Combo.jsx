import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import Header from "../components/AdminHeader";

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function ComboCreator() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');

  const [combos, setCombos] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [resourceId, setResourceId] = useState(null);

  const [inputData, setInputData] = useState({
    name: "",
    description: "",
    bundlePrice: "",
    active: true,
  });
  const [itemDraft, setItemDraft] = useState({ catalogId: "", quantity: 1 });
  const [selectedCatalogItems, setSelectedCatalogItems] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

  const handleRateLimit = (err) => {
    if (err.response?.data === "Too many requests" || err.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers["retry-after"], 10) || 5;
      setRetryTime(retryAfter);
      setError("Too Many Requests");
      setShowRateLimitPopup(true);
      return true;
    }
    return false;
  };

  const notify = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // ----- Fetch combos -----
  const fetchCombos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/combos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCombos(response.data);
    } catch (err) {
      console.error("Error", err);
      handleRateLimit(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  // ----- Fetch catalog (for the item picker) -----
  const fetchCatalog = async () => {
    try {
      const response = await axios.get(`${API_URL}/catalog/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCatalog(response.data);
    } catch (err) {
      console.error("Error", err);
      handleRateLimit(err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const resetForm = () => {
    setInputData({ name: "", description: "", bundlePrice: "", active: true });
    setSelectedCatalogItems([]);
    setItemDraft({ catalogId: "", quantity: 1 });
  };

  // ----- Create modal open/close -----
  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  // ----- Edit modal open/close -----
  const openUpdateForm = (id) => {
    const combo = combos.find((c) => c.comboId === id);
    if (!combo) return;

    setResourceId(id);
    setInputData({
      name: combo.name,
      description: combo.description ?? "",
      bundlePrice: combo.bundlePrice,
      active: combo.active,
    });
    setSelectedCatalogItems(
      (combo.comboItems || []).map((it) => ({
        comboItemId: it.comboItemId,
        catalog: it.catalog,
        quantity: it.quantity,
      }))
    );
    setItemDraft({ catalogId: "", quantity: 1 });
    setIsEditFormOpen(true);
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setResourceId(null);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleItemDraftChange = (e) => {
    const { name, value } = e.target;
    setItemDraft((prev) => ({ ...prev, [name]: value }));
  };

  // ----- Items builder (shared by create + edit forms) -----
  const addComboItem = () => {
    if (!itemDraft.catalogId || Number(itemDraft.quantity) < 1) return;

    const catalogItem = catalog.find((c) => c.catalogId === Number(itemDraft.catalogId));
    if (!catalogItem) return;

    setSelectedCatalogItems((prev) => {
      const key = (it) => it.catalog.catalogId;
      const existing = prev.find((it) => key(it) === catalogItem.catalogId);
      if (existing) {
        return prev.map((it) =>
          key(it) === catalogItem.catalogId
            ? { ...it, quantity: it.quantity + Number(itemDraft.quantity) }
            : it
        );
      }
      return [
        ...prev,
        {
          tempId: `temp-${Date.now()}`,
          catalog: catalogItem,
          quantity: Number(itemDraft.quantity),
        },
      ];
    });

    setItemDraft({ catalogId: "", quantity: 1 });
  };

  const removeComboItem = (key) => {
    setSelectedCatalogItems((prev) =>
      prev.filter((it) => (it.tempId ?? it.comboItemId) !== key)
    );
  };

  const updateItemQuantity = (key, quantity) => {
    const q = Math.max(1, Number(quantity) || 1);
    setSelectedCatalogItems((prev) =>
      prev.map((it) =>
        (it.tempId ?? it.comboItemId) === key ? { ...it, quantity: q } : it
      )
    );
  };

  const individualTotal = useMemo(
    () =>
      selectedCatalogItems.reduce(
        (sum, it) => sum + (it.catalog?.catalog_price ?? 0) * it.quantity,
        0
      ),
    [selectedCatalogItems]
  );
  const bundlePriceNum = Number(inputData.bundlePrice || 0);
  const savings = individualTotal - bundlePriceNum;

  const buildPayload = () => ({
    name: inputData.name,
    description: inputData.description,
    bundlePrice: Number(inputData.bundlePrice),
    active: inputData.active,
    comboItems: selectedCatalogItems.map((it) => ({
      catalogId: it.catalog.catalogId,
      quantity: it.quantity,
    })),
  });

  // ----- Create -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCatalogItems.length < 2) {
      window.alert("A combo needs at least 2 items.");
      return;
    }

    try {
      await axios.post(`${API_URL}/combos`, buildPayload(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      fetchCombos();
      notify("Combo created successfully.");
      closeForm();
      resetForm();
    } catch (err) {
      console.error('Failed to add Combo:', err);
      handleRateLimit(err);
    }
  };

  // ----- Update -----
  const updateCombo = async (e) => {
    e.preventDefault();

    if (selectedCatalogItems.length < 2) {
      window.alert("A combo needs at least 2 items.");
      return;
    }

    try {
      await axios.put(`${API_URL}/combos/${resourceId}`, buildPayload(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      fetchCombos();
      notify("Combo updated successfully.");
      closeEditForm();
    } catch (err) {
      console.error('Failed to update Combo:', err);
      handleRateLimit(err);
    }
  };

  // ----- Delete -----
  const deleteCombo = async (id) => {
    if (!window.confirm("Delete this combo? This can't be undone.")) return;

    try {
      await axios.delete(`${API_URL}/combos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setCombos((prev) => prev.filter((c) => c.comboId !== id));
      notify("Combo deleted successfully.");
    } catch (err) {
      console.error('Failed to delete Combo:', err);
      handleRateLimit(err);
    }
  };

  // ----- Activate / deactivate -----
  const toggleComboActive = async (id, isCurrentlyActive) => {
    try {
      const endpoint = isCurrentlyActive ? "deactivate" : "activate";
      await axios.patch(`${API_URL}/combos/${id}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCombos((prev) =>
        prev.map((c) => (c.comboId === id ? { ...c, active: !isCurrentlyActive } : c))
      );
    } catch (err) {
      console.error('Failed to toggle combo status:', err);
      handleRateLimit(err);
    }
  };

  // Shared items-builder markup used by both the create and edit forms.
  const renderItemsBuilder = () => (
    <div className="border-t border-[#A65A34]/15 pt-4 mb-2">
      <h4 className="text-sm font-semibold text-[#3B2A20] mb-3">Items</h4>

      {selectedCatalogItems.length > 0 ? (
        <ul className="mb-4 max-h-44 overflow-y-auto rounded-lg border border-[#A65A34]/15 divide-y divide-[#A65A34]/10 bg-white">
          {selectedCatalogItems.map((it) => {
            const key = it.tempId ?? it.comboItemId;
            return (
              <li key={key} className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[#3B2A20]">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{it.catalog.catalogName}</span>
                  <span className="text-[#3B2A20]/60 shrink-0">{currency(it.catalog.catalog_price)} ea</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <input
                    type="number" min="1" max="99" value={it.quantity}
                    onChange={(e) => updateItemQuantity(key, e.target.value)}
                    className="w-14 bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-md text-center p-1.5"
                  />
                  <button
                    type="button" onClick={() => removeComboItem(key)}
                    className="cursor-pointer p-1 rounded-md hover:bg-red-100 text-red-600 transition-colors duration-150"
                    title="Remove item"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-[#3B2A20]/50">No items staged yet. Add at least 2 below.</p>
      )}

      <div className="grid gap-3 grid-cols-6 items-end">
        <div className="col-span-4 sm:col-span-4">
          <label htmlFor="item-catalog" className="block mb-2 text-sm font-medium text-[#3B2A20]">Catalog Item</label>
          <select
            name="catalogId" id="item-catalog" value={itemDraft.catalogId} onChange={handleItemDraftChange}
            className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3"
          >
            <option value="">Select an item</option>
            {catalog.map((c) => (
              <option key={c.catalogId} value={c.catalogId}>
                {c.catalogName} — {currency(c.catalog_price)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-2">
          <label htmlFor="item-quantity" className="block mb-2 text-sm font-medium text-[#3B2A20]">Qty</label>
          <input
            type="number" name="quantity" id="item-quantity" value={itemDraft.quantity} onChange={handleItemDraftChange}
            min="1" max="99"
            className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3"
          />
        </div>
      </div>

      <button
        type="button" onClick={addComboItem}
        className="mt-3 inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-[#A65A34] hover:text-[#8A4A2A] transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Item
      </button>

      {selectedCatalogItems.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#EFE6D8] px-4 py-3 text-sm">
          <span className="text-[#3B2A20]/70">Items priced individually: <span className="font-medium text-[#3B2A20]">{currency(individualTotal)}</span></span>
          {inputData.bundlePrice !== "" && (
            <span className={`font-semibold ${savings > 0 ? "text-[#5D6B3D]" : "text-[#A65A34]"}`}>
              {savings > 0 ? `Saves ${currency(savings)}` : savings < 0 ? `${currency(Math.abs(savings))} over` : "No savings"}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#3B2A20]">Combos</h1>
            <p className="text-sm text-[#3B2A20]/60 mt-1">Bundle catalog items together at a set price</p>
          </div>
          <button
            onClick={openForm}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-6 py-3 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Combo
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center my-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
          </div>
        )}

        {!isLoading && combos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
            <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg">No combos yet. Create your first one.</p>
          </div>
        )}

        {!isLoading && combos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {combos.map((c) => (
              <div
                key={c.comboId}
                className="bg-white rounded-xl border border-[#A65A34]/10 shadow-sm hover:shadow-md transition-shadow duration-150 overflow-hidden flex flex-col"
              >
                <div className="px-5 pt-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-[#3B2A20] text-base leading-snug">{c.name}</h3>
                    <button
                      type="button"
                      onClick={() => toggleComboActive(c.comboId, c.active)}
                      className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ${c.active ? "bg-[#8A9A5B]" : "bg-[#3B2A20]/20"}`}
                      aria-pressed={c.active}
                      title={c.active ? "Deactivate" : "Activate"}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${c.active ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {c.description && (
                    <p className="text-sm text-[#3B2A20]/60 mt-1.5 leading-relaxed">{c.description}</p>
                  )}

                  <ul className="mt-4 space-y-1.5">
                    {(c.comboItems || []).map((it) => (
                      <li key={it.comboItemId} className="flex items-center justify-between text-sm text-[#3B2A20]">
                        <span className="truncate pr-2">
                          <span className="text-[#A65A34] font-medium">{it.quantity}×</span>{" "}
                          {it.catalog?.catalogName}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 bg-[#EFE6D8] border-t border-[#A65A34]/10">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.active ? "bg-[#8A9A5B]/15 text-[#5D6B3D]" : "bg-[#3B2A20]/10 text-[#3B2A20]/50"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-lg font-bold text-[#A65A34]">{currency(c.bundlePrice)}</span>
                </div>

                <div className="flex items-center gap-2 px-5 py-3 border-t border-[#A65A34]/10">
                  <button
                    type="button"
                    onClick={() => openUpdateForm(c.comboId)}
                    className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-3 py-2 text-xs font-medium text-[#F7F1E8]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.86 3.86a2.1 2.1 0 0 1 2.97 2.97L7.5 19.16l-4 1 1-4L16.86 3.86Z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCombo(c.comboId)}
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-transparent hover:bg-red-50 border border-red-200 transition-colors duration-150 px-3 py-2 text-xs font-medium text-red-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPopup && (
          <div className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">{popupMessage}</div>
          </div>
        )}

        {showRateLimitPopup && (
          <div className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="ms-1 text-sm font-normal">
              {error || "Too many requests"} — try again in {retryTime}s.
            </div>
          </div>
        )}

        {/* Create Combo modal */}
        {isFormOpen && (
          <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-2xl max-h-full">
              <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15">

                <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                  <h3 className="text-lg font-semibold text-[#3B2A20]">Create Combo</h3>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5">
                  <div className="grid gap-5 mb-5 grid-cols-2 max-h-[65vh] overflow-y-auto pr-1">

                    <div className="col-span-2">
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                      <input
                        type="text" name="name" id="name" value={inputData.name} onChange={handleChange}
                        maxLength={50} required placeholder="e.g. Classic Value Meal"
                        className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3"
                      />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                      <textarea
                        name="description" id="description" value={inputData.description} onChange={handleChange}
                        maxLength={200} rows={2} placeholder="A short description shown to customers"
                        className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 resize-none"
                      />
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="bundlePrice" className="block mb-2 text-sm font-medium text-[#3B2A20]">Bundle Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2A20]/50 text-sm">$</span>
                        <input
                          type="number" name="bundlePrice" id="bundlePrice" value={inputData.bundlePrice} onChange={handleChange}
                          step="0.01" min="0.01" max="1000000" required placeholder="0.00"
                          className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 pl-7"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox" name="active" checked={inputData.active} onChange={handleChange}
                          className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"
                        />
                        <span className="text-sm font-medium text-[#3B2A20]">Active</span>
                      </label>
                    </div>
                  </div>

                  {renderItemsBuilder()}

                  <button
                    type="submit"
                    className="text-[#F7F1E8] inline-flex items-center justify-center w-full sm:w-auto cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm"
                  >
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Combo{selectedCatalogItems.length > 0 ? ` + ${selectedCatalogItems.length} Item${selectedCatalogItems.length === 1 ? "" : "s"}` : ""}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Combo modal */}
        {isEditFormOpen && (
          <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-2xl max-h-full">
              <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15">

                <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                  <h3 className="text-lg font-semibold text-[#3B2A20]">Edit Combo</h3>
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                <form onSubmit={updateCombo} className="px-6 py-5">
                  <div className="grid gap-5 mb-5 grid-cols-2 max-h-[65vh] overflow-y-auto pr-1">

                    <div className="col-span-2">
                      <label htmlFor="edit-name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                      <input
                        type="text" name="name" id="edit-name" value={inputData.name} onChange={handleChange}
                        maxLength={50} required placeholder="e.g. Classic Value Meal"
                        className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3"
                      />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="edit-description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                      <textarea
                        name="description" id="edit-description" value={inputData.description} onChange={handleChange}
                        maxLength={200} rows={2} placeholder="A short description shown to customers"
                        className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 resize-none"
                      />
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="edit-bundlePrice" className="block mb-2 text-sm font-medium text-[#3B2A20]">Bundle Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2A20]/50 text-sm">$</span>
                        <input
                          type="number" name="bundlePrice" id="edit-bundlePrice" value={inputData.bundlePrice} onChange={handleChange}
                          step="0.01" min="0.01" max="1000000" required placeholder="0.00"
                          className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 pl-7"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox" name="active" checked={inputData.active} onChange={handleChange}
                          className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"
                        />
                        <span className="text-sm font-medium text-[#3B2A20]">Active</span>
                      </label>
                    </div>
                  </div>

                  {renderItemsBuilder()}

                  <button
                    type="submit"
                    className="text-[#F7F1E8] inline-flex items-center justify-center w-full sm:w-auto cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm"
                  >
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}