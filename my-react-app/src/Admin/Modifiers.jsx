import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination.jsx';
import axios from 'axios';

const ModifierGroups = () => {
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken');
   const [inputData, setInputData] = useState({
    name: "",
    required: false,
    minSelections: 0,
    maxSelections: 1,
    catalogId: "",
   })

   // Hardcoded catalogs used to populate the Catalog selector dropdown.
   // Mirrors the Catalog entity (catalogId, catalogName). Swap for a fetchCatalogs()
   // call once the /catalog endpoint is wired up — keep this as the fallback/seed data.
   const [catalogs, setCatalogs] = useState([]);
   const API_URL = import.meta.env.VITE_API_URL;

   const [modifierGroups, setModifierGroups] = useState([]);
   const [modifierOptions, setModifierOptions] = useState([]);
   const [isCurrentlyActive, setIsCurrentlyActive] = useState(true);
   const [isCurrentlyActive2, setIsCurrentlyActive2] = useState(true);
   const [resourceId, setResourceId] = useState(null);
   const [showPopup, setShowPopup] = useState(false);
   const [popupMessage, setPopupMessage] = useState("Modifier group added successfully.");
   const [showPopup3, setShowPopup3] = useState(false);
   const [currentPage, setCurrentPage] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [isLoading, setIsLoading] = useState(false);
   const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
   const [pageSize] = useState(5);
   // Modifier Options modal state
   const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
   const [selectedGroup, setSelectedGroup] = useState(false);
   const [editingOptionId, setEditingOptionId] = useState(null);
   const [optionInputData, setOptionInputData] = useState({
    name: "",
    priceAdjustment: "",
    active: true,
   });
   const [showOptionPopup, setShowOptionPopup] = useState(false);
   const [optionPopupMessage, setOptionPopupMessage] = useState("");

   // Options staged inside the "Add Modifier Group" form, created together with the group on submit
   const [newGroupOptions, setNewGroupOptions] = useState([]);
   const [newGroupOptionDraft, setNewGroupOptionDraft] = useState({
    name: "",
    priceAdjustment: "",
    active: true,
   });

   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    name: "",
    required: false,
    minSelections: 0,
    maxSelections: 1,
    catalogId: "",
  });
    setNewGroupOptions([]);
    setNewGroupOptionDraft({ name: "", priceAdjustment: "", active: true });
  };

  const fetchCatalog = async () => {
          try {
            const response = await axios.get(`${API_URL}/catalog/all`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
          setCatalogs(response.data)
          setIsLoading(false);
          } catch (error) {
            console.error("Error", error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          
          }
        }

    useEffect(() => {
        fetchCatalog();
    }, []);

    console.log(catalogs);

  // GET ALL MODIFIER GROUPS
  const fetchData = async (page = 0) => {
          try {
            const response = await axios.get(`${API_URL}/modifierGroup?page=${page}&size=${pageSize}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setModifierGroups(response.data.content);
            setCurrentPage(response.data.number);
            setTotalPages(response.data.totalPages);
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
        fetchData(0);
    }, []);


    const fetchData2 = async () => {
          try {
            const response = await axios.get(`${API_URL}/modifierOption/all`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setModifierOptions(response.data);
          
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
        fetchData2();
    }, []);


    console.log("Options: ", modifierOptions);
   

  // OPEN UPDATE MODIFIER GROUP DETAILS FORM
  const openUpdateForm = (id) => {

    const selectedModifierGroup = modifierGroups.find(modifierGroups => modifierGroups.modifierGroupId === id)
    setResourceId(id);
    if (selectedModifierGroup) {
      setInputData({
        name: selectedModifierGroup.name,
        required: selectedModifierGroup.required,
        minSelections: selectedModifierGroup.minSelections,
        maxSelections: selectedModifierGroup.maxSelections,
        catalogId: selectedModifierGroup.catalog?.catalogId ?? "",
        modifierOptions: selectedModifierGroup.modifierOptions
      });
    }

    setIsActive2(!isActive2);
}

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  setInputData({ ...inputData, [name]: type === "checkbox" ? checked : value });
  }

console.log("Modifier groups: ", modifierGroups)
  // ADDING A NEW MODIFIER GROUP + OPTIONS
    const handleSubmit = async(event) => {
        event.preventDefault();

        if(newGroupOptions.length < 1) {
          return window.alert("You should have more than 1 option");
        }

        const newModifierGroup = {

          name: inputData.name,
          required: inputData.required,
          minSelections: Number(inputData.minSelections),
          maxSelections: Number(inputData.maxSelections),
          catalogId: inputData.catalogId,
          modifierOptions: newGroupOptions
        };
        try {

            const response = await axios.post(`${API_URL}/modifierGroup/catalogs/${inputData.catalogId}/modifier-groups`, newModifierGroup, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const dt = response.config.data;
            fetchData();

            setPopupMessage("Modifier group added successfully.");

             setShowPopup(true);
    


            setTimeout(() => setShowPopup(false), 3000);
                event.target.reset();

            
            return true;

        } catch (error) {
            console.error('Failed to add Modifier:', error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);

            }
            return false;

        }
       
    }

    // STAGE AN OPTION IN "ADD NEW MODIFIER GROUP FORM"
    // Stage an option inside the "Add Modifier Group" form (not persisted until the group is created)
    // ADDED TO DRAFT STATE NOT FINAL PAYLOAD
    const handleNewGroupOptionDraftChange = (e) => {
      const { name, value, type, checked } = e.target;
      setNewGroupOptionDraft({ ...newGroupOptionDraft, [name]: type === "checkbox" ? checked : value });
    }


    

    console.log("Final options: ", newGroupOptions);
    // THIS FINALIZES THE OPTION TO GO TO PAYLOAD
    // TRIGGERED BY (?)
    const addNewGroupOption = () => {
      if (!newGroupOptionDraft.name.trim() || newGroupOptionDraft.priceAdjustment === "") return;
 
      setNewGroupOptions([...newGroupOptions, {
        tempId: `temp-${Date.now()}-${newGroupOptions.length}`,
        name: newGroupOptionDraft.name,
        priceAdjustment: Number(newGroupOptionDraft.priceAdjustment),
        active: newGroupOptionDraft.active,
      }]);
 
      setNewGroupOptionDraft({ name: "", priceAdjustment: "", active: true });
    }
 
    // REMOVE THE OPTION FROM THE PAYLOAD
    const removeNewGroupOption = (tempId) => {
      setNewGroupOptions(newGroupOptions.filter(o => o.tempId !== tempId));
    }
 

    console.log("Input data: ", inputData);
    console.log("Resource ID: ", resourceId);
    // API ENDPOINT FOR UPDATING THE MODIFIER GROUP DATA
    const updateData = async(e) => {
        e.preventDefault();

        setModifierGroups(modifierGroups.map(g =>
          g.modifierGroupId === resourceId
            ? {
                ...g,
                name: inputData.name,
                required: inputData.required,
                minSelections: Number(inputData.minSelections),
                maxSelections: Number(inputData.maxSelections),
                catalog: catalogs.find(c => c.catalogId === Number(inputData.catalogId)) ?? g.catalog,
                modifierOptions: inputData.modifierOptions
              }
            : g
        ));

        try {

            const response = await axios.put(`${API_URL}/modifierGroup/catalogs/${inputData.catalogId}/modifier-groups/${resourceId}`, inputData, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const dt = response.config.data;
            fetchData();

            setPopupMessage("Modifier group added successfully.");

             setShowPopup3(true);
        setTimeout(() => setShowPopup3(false), 3000);

        openUpdateForm(isActive2);

            
            return true;

        } catch (error) {
            console.error('Failed to add Modifier:', error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);

            }
            return false;

        }

        

       
      }

       // Instantly reflect an option change in both the open modal and the table row
const updateSelectedGroupOptions = (updater) => {
  if (!selectedGroup) return;
  setSelectedGroup(prev => prev ? { ...prev, modifierOptions: updater(prev.modifierOptions || []) } : prev);
  setModifierGroups(prev => prev.map(g =>
    g.modifierGroupId === selectedGroup.modifierGroupId
      ? { ...g, modifierOptions: updater(g.modifierOptions || []) }
      : g
  ));
};

  // SWITCHING MODIFIER ACTIVE STATUS ON AND OFF
  const toggleModifierActiveStatus = async (id, isCurrentlyActive) => {
    try {
      const endpoint = isCurrentlyActive ? "deactivate" : "activate";
      await axios.patch(`${API_URL}/modifierGroup/${id}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchData(currentPage);
    } catch (error) {
      console.error('Failed to toggle promo code status:', error);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
  }

  // ----- Modifier Options modal helpers -----

  const resetOptionForm = () => {
    setOptionInputData({ name: "", priceAdjustment: "", active: true });
    setEditingOptionId(null);
  }

  const openOptionsModal = (group) => {
    setSelectedGroup(group);
    resetOptionForm();
    setIsOptionsModalOpen(true);
  }

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setSelectedGroup(null);
    resetOptionForm();
  }

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptionInputData({ ...optionInputData, [name]: type === "checkbox" ? checked : value });
  }

    
  const getAllOptionIds = () => Object.values(modifierOptions).flat().map(o => o.modifierOptionId);


  // API CALL WHERE OPTIONS ARE ADDED/edited 
  const handleOptionSubmit = async(e) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const groupId = selectedGroup.modifierGroupId;
    const currentOptions = modifierOptions[groupId] || [];

      const newOption = {
        modifierOptionId: editingOptionId,
        name: optionInputData.name,
        priceAdjustment: Number(optionInputData.priceAdjustment),
        modifierGroupId: groupId
      };

    if (editingOptionId) {
      // Update existing option
      try {

            const response = await axios.put(`${API_URL}/modifierOption/modifier-groups/${groupId}/modifier-options/${editingOptionId}`, newOption, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            updateSelectedGroupOptions(options =>
      options.map(o => o.modifierOptionId === editingOptionId ? { ...o, ...response.data } : o)
    );
            const dt = response.config.data;
     


            
    


            setTimeout(() => setShowPopup(false), 3000);
                event.target.reset();

                openForm(isActive);
            return true;

        } catch (error) {
            console.error('Failed to edit Modifier:', error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);

            }
            return false;

        }
      setOptionPopupMessage("Modifier option updated successfully.");


    } else {
      // Add a new option - form stays open so more options can be added right after
      const allIds = getAllOptionIds();
      const nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

    

      try {

            const response = await axios.post(`${API_URL}/modifierOption/modifier-groups/${groupId}/modifier-options`, newOption, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            updateSelectedGroupOptions(options => [...options, response.data]);
            const dt = response.config.data;
          

             setOptionPopupMessage("Modifier option added successfully.");
            setTimeout(() => setShowPopup(false), 3000);
                event.target.reset();

                openForm(isActive);
            return true;

        } catch (error) {
            console.error('Failed to add Modifier:', error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);

            }
            return false;

        }

      
    }

    fetchData();
    
    setShowOptionPopup(true);
    setTimeout(() => setShowOptionPopup(false), 2500);

    resetOptionForm();
  }

  // EDITING A SINGLE OPTION
  const startEditOption = (option) => {
    setEditingOptionId(option.modifierOptionId);
    setOptionInputData({
      name: option.name,
      priceAdjustment: option.priceAdjustment,
      active: option.active,
    });
  }

  console.log("Selected group: ", selectedGroup);

  // EXITING OPTION FORM
  const cancelEditOption = () => {
    resetOptionForm();
  }

 

  // ACTUALLY REMOVING THE OPTION
  const deleteOption = async(optionId) => {
         try {

            const response = await axios.delete(`${API_URL}/modifierOption/modifier-options/${optionId}`, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            updateSelectedGroupOptions(options => options.filter(o => o.modifierOptionId !== optionId));
            const dt = response.config.data;
            fetchData();


             setShowPopup(true);
    


            setTimeout(() => setShowPopup(false), 3000);
                event.target.reset();

                openForm(isActive);
            return true;

        } catch (error) {
            console.error('Failed to add Modifier:', error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);

            }
            return false;

        }
      setNewGroupOptions(newGroupOptions.filter(o => o.optionId !== optionId));
  }

  const toggleOptionActive = async (groupId, optionId, isCurrentlyActive2) => {
    try {
      const endpoint = isCurrentlyActive2 ? "deactivate" : "activate";
      await axios.patch(`${API_URL}/modifierOption/${optionId}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      updateSelectedGroupOptions(options =>
  options.map(o => o.modifierOptionId === optionId ? { ...o, active: !isCurrentlyActive2 } : o)
);
      fetchData(currentPage);
    } catch (error) {
      console.error('Failed to toggle modifierOption status:', error);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
  }

  const currentGroupOptions = selectedGroup ? (modifierOptions[selectedGroup.modifierGroupId] || []) : [];

  return (
    <div className="body bg-[#F7F1E8] min-h-screen">
      <Header />
      <div className="users max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        <div className="flex items-center justify-between pt-8 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#3B2A20]">Modifier Groups</h1>
            <p className="text-sm text-[#3B2A20]/60 mt-1">Manage modifier groups for catalog items</p>
          </div>
          <button onClick={openForm} className="flex justify-center items-center gap-2 cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-6 py-3 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Add Modifier Group
          </button>
        </div>

        {!isLoading && modifierGroups.length == 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
            <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6-2a4 4 0 10-4-4"/></svg>
            <p className="text-lg">There are no modifier groups found.</p>
          </div>
        )}

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-xl max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Add Modifier Group
                        </h3>
                        <button type="button" onClick={openForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="col-span-2">
                          <label htmlFor="name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" name="name" id="name" value={inputData.name} onChange={handleChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. Size" required/>
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="catalogId" className="block mb-2 text-sm font-medium text-[#3B2A20]">Catalog</label>
                          <select name="catalogId" id="catalogId" value={inputData.catalogId} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required>
                            <option value="" disabled>Select a catalog</option>
                            {catalogs.map(c => (
                              <option key={c.catalogId} value={c.catalogId}>{c.catalogName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1 flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="required" checked={inputData.required} onChange={handleChange} className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"/>
                            <span className="text-sm font-medium text-[#3B2A20]">Required</span>
                          </label>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="minSelections" className="block mb-2 text-sm font-medium text-[#3B2A20]">Min Selections</label>
                          <input type="number" name="minSelections" id="minSelections" value={inputData.minSelections} onChange={handleChange} step="1" min="0" max="1000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="maxSelections" className="block mb-2 text-sm font-medium text-[#3B2A20]">Max Selections</label>
                          <input type="number" name="maxSelections" id="maxSelections" value={inputData.maxSelections} onChange={handleChange} step="1" min="1" max="1000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="1" required/>
                        </div>
                      </div>

                        {/* Options builder - stage as many options as needed, they're created together with the group */}
                        <div className="border-t border-[#A65A34]/15 pt-4 mb-2">
                          <h4 className="text-sm font-semibold text-[#3B2A20] mb-3">Options</h4>

                          {newGroupOptions.length > 0 && (
                            <ul className="mb-4 max-h-36 overflow-y-auto rounded-lg border border-[#A65A34]/15 divide-y divide-[#A65A34]/10 bg-white">
                              {newGroupOptions.map(o => (
                                <li key={o.tempId} className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[#3B2A20]">
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span className="font-medium truncate">{o.name}</span>
                                    <span className="text-[#3B2A20]/60 shrink-0">+${o.priceAdjustment.toFixed(2)}</span>
                                    {!o.active && (
                                      <span className="inline-flex items-center rounded-full bg-[#3B2A20]/10 text-[#3B2A20]/60 text-xs font-semibold px-2 py-0.5 shrink-0">Inactive</span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeNewGroupOption(o.tempId)}
                                    className="cursor-pointer p-1 rounded-md hover:bg-red-100 text-red-600 transition-colors duration-150 shrink-0"
                                    title="Remove option"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/>
                                    </svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="grid gap-3 grid-cols-6 items-end">
                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="new-option-name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Option Name</label>
                              <input type="text" name="name" id="new-option-name" value={newGroupOptionDraft.name} onChange={handleNewGroupOptionDraftChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="e.g. Small"/>
                            </div>

                            <div className="col-span-3 sm:col-span-2">
                              <label htmlFor="new-option-price" className="block mb-2 text-sm font-medium text-[#3B2A20]">Price Adj.</label>
                              <input type="number" name="priceAdjustment" id="new-option-price" value={newGroupOptionDraft.priceAdjustment} onChange={handleNewGroupOptionDraftChange} step="0.01" min="0.01" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="0.50"/>
                            </div>

                            <div className="col-span-3 sm:col-span-1 flex items-center justify-between gap-1 pb-3">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input type="checkbox" name="active" checked={newGroupOptionDraft.active} onChange={handleNewGroupOptionDraftChange} className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"/>
                                <span className="text-xs font-medium text-[#3B2A20]">Active</span>
                              </label>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={addNewGroupOption}
                            className="mt-3 inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-[#A65A34] hover:text-[#8A4A2A] transition-colors duration-150"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
                            Add Option
                          </button>
                        </div>

                        <button type="submit" className="text-[#F7F1E8] inline-flex items-center justify-center w-full sm:w-auto cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Create Group{newGroupOptions.length > 0 ? ` + ${newGroupOptions.length} Option${newGroupOptions.length === 1 ? "" : "s"}` : ""}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )}

        {showPopup && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{popupMessage}</div>
        </div>
        </div>
        </div>
              )}

        {showPopup3 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Modifier group updated successfully.</div>
        </div>
        </div>
        </div>
              )}

        {showOptionPopup && (
           <div>
        <div id="toast-top-right-options" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success-options" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{optionPopupMessage}</div>
        </div>
        </div>
        </div>
              )}

        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
            </div>
          )}

        <div className="relative overflow-x-auto rounded-xl shadow-md border border-[#A65A34]/10">
          {modifierGroups.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right">
          <thead className="sticky top-0 bg-[#EFE6D8] text-[#3B2A20] border-b border-[#A65A34]/15 z-10">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Name</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Catalog</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Required</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Selections</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Options</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-center">Status</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-center">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {modifierGroups.map(g => (
              <tr className="border-b border-[#A65A34]/10 hover:bg-[#FBF8F3] transition-colors duration-150" key={g.modifierGroupId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#A65A34]/15 text-[#A65A34] flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
                      </svg>
                    </div>
                    <span className="font-semibold block">{g.name}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  {g.catalog?.catalogName ?? "—"}
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  {g.required ? (
                    <span className="inline-flex items-center rounded-full bg-[#A65A34]/15 text-[#A65A34] text-xs font-semibold px-2.5 py-1">Required</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[#3B2A20]/10 text-[#3B2A20]/60 text-xs font-semibold px-2.5 py-1">Optional</span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  {g.minSelections} – {g.maxSelections}
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  <button
                    type="button"
                    onClick={() => openOptionsModal(g)}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-[#A65A34] hover:text-[#8A4A2A] font-medium underline-offset-2 hover:underline"
                  >
                    {g.modifierOptions?.length} option{(g.modifierOptions || []).length === 1 ? "" : "s"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </td>

                <td className="px-6 py-4 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => toggleModifierActiveStatus(g.modifierGroupId, g.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ${g.active ? "bg-[#8A9A5B]" : "bg-[#3B2A20]/20"}`}
                    aria-pressed={g.active}
                    title={g.active ? "Deactivate" : "Activate"}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${g.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <div className={`text-xs mt-1 font-medium ${g.active ? "text-[#5D6B3D]" : "text-[#3B2A20]/40"}`}>
                    {g.active ? "Active" : "Inactive"}
                  </div>
                </td>

                <td className="px-6 py-4 max-w-xs break-words text-sm align-middle text-center">
          <div className="flex items-center justify-center gap-2">

            <button
              className="cursor-pointer p-2 rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 shadow-sm"
              onClick={() => openUpdateForm(g.modifierGroupId)}
              title="Edit"
            >
              <svg className="w-4 h-4 text-[#F7F1E8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.86 3.86a2.1 2.1 0 0 1 2.97 2.97L7.5 19.16l-4 1 1-4L16.86 3.86Z"/>
              </svg>
            </button>

            <button
              className="cursor-pointer p-2 rounded-lg bg-[#3B2A20] hover:bg-[#2A1D15] transition-colors duration-150 shadow-sm"
              onClick={() => openOptionsModal(g)}
              title="Manage Options"
            >
              <svg className="w-4 h-4 text-[#F7F1E8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
                <circle cx="19" cy="18" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>
        </td>

            </tr>
            ))}
            </tbody>

          </table>
          )}


        {isActive2 && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Edit Modifier Group Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={updateData} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="col-span-2">
                          <label htmlFor="edit-name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" name="name" id="edit-name" value={inputData.name} onChange={handleChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. Size" required/>
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="edit-catalogId" className="block mb-2 text-sm font-medium text-[#3B2A20]">Catalog</label>
                          <select name="catalogId" id="edit-catalogId" value={inputData.catalogId} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required>
                            <option value="" disabled>Select a catalog</option>
                            {catalogs.map(c => (
                              <option key={c.catalogId} value={c.catalogId}>{c.catalogName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1 flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="required" checked={inputData.required} onChange={handleChange} className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"/>
                            <span className="text-sm font-medium text-[#3B2A20]">Required</span>
                          </label>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-minSelections" className="block mb-2 text-sm font-medium text-[#3B2A20]">Min Selections</label>
                          <input type="number" name="minSelections" id="edit-minSelections" value={inputData.minSelections} onChange={handleChange} step="1" min="0" max="1000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-maxSelections" className="block mb-2 text-sm font-medium text-[#3B2A20]">Max Selections</label>
                          <input type="number" name="maxSelections" id="edit-maxSelections" value={inputData.maxSelections} onChange={handleChange} step="1" min="1" max="1000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="1" required/>
                        </div>
                      </div>
                        <button type="submit" className="text-[#F7F1E8] cursor-pointer inline-flex items-center justify-center w-full sm:w-auto bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )}

        {/* Modifier Options modal - view/add/edit options that belong to a selected group */}
        {isOptionsModalOpen && selectedGroup && (
            <div id="options-modal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-2xl max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <div>
                          <h3 className="text-lg font-semibold text-[#3B2A20]">
                              Modifier Options
                          </h3>
                          <p className="text-sm text-[#3B2A20]/60 mt-0.5">
                            {selectedGroup.name} <span className="text-[#3B2A20]/40">·</span> {selectedGroup.catalog?.catalogName ?? "—"}
                          </p>
                        </div>
                        <button type="button" onClick={closeOptionsModal} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="options-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="px-6 py-5">

                      {/* Existing options list */}
                      <div className="max-h-64 overflow-y-auto rounded-lg border border-[#A65A34]/15 mb-5">
                        {selectedGroup.modifierOptions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-[#3B2A20]/50">
                            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                            <p className="text-sm">No options yet. Add the first one below.</p>
                          </div>
                        ) : (
                          <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 bg-[#EFE6D8] text-[#3B2A20] border-b border-[#A65A34]/15">
                              <tr>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Name</th>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Price Adj.</th>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-center">Status</th>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {selectedGroup.modifierOptions.map(o => (
                                <tr key={o.modifierOptionId} className={`border-b border-[#A65A34]/10 last:border-b-0 ${editingOptionId === o.modifierOptionId ? "bg-[#A65A34]/5" : ""}`}>
                                  <td className="px-4 py-3 text-[#3B2A20] font-medium max-w-[10rem] break-words">{o.name}</td>
                                  <td className="px-4 py-3 text-[#3B2A20]">+${Number(o.priceAdjustment).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionActive(selectedGroup.modifierGroupId, o.modifierOptionId, o.active)}
                                      className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors duration-200 ${o.active ? "bg-[#8A9A5B]" : "bg-[#3B2A20]/20"}`}
                                      aria-pressed={o.active}
                                      title={o.active ? "Deactivate" : "Activate"}
                                    >
                                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${o.active ? "translate-x-4.5" : "translate-x-1"}`} />
                                    </button>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => startEditOption(o)}
                                        className="cursor-pointer p-1.5 rounded-md hover:bg-[#A65A34]/10 text-[#A65A34] transition-colors duration-150"
                                        title="Edit option"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.86 3.86a2.1 2.1 0 0 1 2.97 2.97L7.5 19.16l-4 1 1-4L16.86 3.86Z"/>
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteOption(o.modifierOptionId)}
                                        className="cursor-pointer p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors duration-150"
                                        title="Remove option"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Add / edit option form - stays open after submit so multiple options can be added in a row */}
                      <form onSubmit={handleOptionSubmit} className="border-t border-[#A65A34]/15 pt-5">
                        <h4 className="text-sm font-semibold text-[#3B2A20] mb-3">
                          {editingOptionId ? "Edit Option" : "Add Option"}
                        </h4>
                        <div className="grid gap-4 grid-cols-6 items-end">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="option-name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                            <input type="text" name="name" id="option-name" value={optionInputData.name} onChange={handleOptionChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="e.g. Oat Milk" required/>
                          </div>

                          <div className="col-span-3 sm:col-span-2">
                            <label htmlFor="option-priceAdjustment" className="block mb-2 text-sm font-medium text-[#3B2A20]">Price Adjustment</label>
                            <input type="number" name="priceAdjustment" id="option-priceAdjustment" value={optionInputData.priceAdjustment} onChange={handleOptionChange} step="0.01" min="0.00" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="0.50" required/>
                          </div>

                          <div className="col-span-3 sm:col-span-1 flex items-center pb-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" name="active" checked={optionInputData.active} onChange={handleOptionChange} className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"/>
                              <span className="text-sm font-medium text-[#3B2A20]">Active</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <button type="submit" className="text-[#F7F1E8] inline-flex items-center justify-center cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            {editingOptionId ? "Save Changes" : "Add Option"}
                          </button>
                          {editingOptionId && (
                            <button type="button" onClick={cancelEditOption} className="cursor-pointer inline-flex items-center justify-center bg-transparent hover:bg-[#A65A34]/10 transition-colors duration-150 font-medium rounded-lg text-sm px-6 py-3 text-center text-[#3B2A20]">
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                    </div>
                </div>
            </div>
        </div>
        )}

        </div>
      </div>

      {modifierGroups.length > 0 && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={() => {}} />
      </div>
      )}
    </div>
  )
}


export default ModifierGroups;