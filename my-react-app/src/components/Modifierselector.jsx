// Place this file at: src/components/ModifierSelector.jsx
//
// Usage (controlled, same pattern as DiscountSelector / TippingSelector):
//
//   const [selections, setSelections] = useState({}); // { [modifierGroupId]: number[] }
//
//   <ModifierSelector
//     modifierGroups={item.catalog.modifierGroups}
//     selections={selections}
//     setSelections={setSelections}
//   />
//
// `selections` ends up as { groupId: [optionId, optionId, ...] } which you can
// flatten into whatever shape your basket/order payload expects.

import React from 'react';

const ModifierSelector = ({ modifierGroups = [], selections = {}, setSelections }) => {
  if (!modifierGroups.length) return null;

  const getSelected = (groupId) => selections[groupId] || [];

  const isGroupSatisfied = (group) => {
    const count = getSelected(group.modifierGroupId).length;
    return count >= group.minSelections;
  };

  const toggleOption = (group, optionId) => {
    const groupId = group.modifierGroupId;
    const current = getSelected(groupId);
    const isSingleSelect = group.maxSelections === 1;

    let next;
    if (isSingleSelect) {
      // Radio-style: clicking the already-selected option clears it unless the group is required
      if (current.includes(optionId)) {
        next = group.required ? current : [];
      } else {
        next = [optionId];
      }
    } else {
      if (current.includes(optionId)) {
        next = current.filter((id) => id !== optionId);
      } else {
        if (current.length >= group.maxSelections) return; // at cap, ignore
        next = [...current, optionId];
      }
    }

    setSelections({ ...selections, [groupId]: next });
  };

  return (
    <div className="space-y-6">
      {modifierGroups
        .filter((g) => g.active)
        .map((group) => {
          const selected = getSelected(group.modifierGroupId);
          const satisfied = isGroupSatisfied(group);
          const singleSelect = group.maxSelections === 1;

          return (
            <div key={group.modifierGroupId} className="rounded-lg border border-[#E7DCC9] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#3B2A20]">{group.name}</h3>
                <div className="flex items-center gap-2">
                  {group.required && (
                    <span className="inline-flex items-center rounded-full bg-[#A65A34]/15 text-[#A65A34] text-xs font-semibold px-2.5 py-0.5">
                      Required
                    </span>
                  )}
                  <span className={`text-xs font-medium ${satisfied ? "text-[#5D6B3D]" : "text-[#8A7862]"}`}>
                    {selected.length}/{group.maxSelections} selected
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(group.modifierOptions || [])
                  .filter((o) => o.active)
                  .map((option) => {
                    const isSelected = selected.includes(option.modifierOptionId);
                    return (
                      <label
                        key={option.modifierOptionId}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-2.5 text-sm transition-colors ${
                          isSelected ? "border-[#A65A34] bg-[#A65A34]/5" : "border-[#E7DCC9] hover:bg-[#FBF6EE]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type={singleSelect ? "radio" : "checkbox"}
                            name={singleSelect ? `group-${group.modifierGroupId}` : undefined}
                            checked={isSelected}
                            onChange={() => toggleOption(group, option.modifierOptionId)}
                            className="h-4 w-4 cursor-pointer accent-[#A65A34]"
                          />
                          <span className="text-[#3B2A20]">{option.name}</span>
                        </span>
                        {Number(option.priceAdjustment) > 0 && (
                          <span className="text-[#8A7862]">+PHP {Number(option.priceAdjustment).toFixed(2)}</span>
                        )}
                      </label>
                    );
                  })}
              </div>

              {group.required && !satisfied && (
                <p className="mt-2 text-xs text-red-600">
                  Select at least {group.minSelections} option{group.minSelections === 1 ? "" : "s"}.
                </p>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default ModifierSelector;