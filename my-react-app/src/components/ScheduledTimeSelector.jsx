import React, { useMemo, useState } from 'react';

// Hardcoded business hours + how many days ahead scheduling is allowed.
// Swap for real store hours (e.g. fetched per-restaurant) later.
const OPEN_HOUR = 9; // 9:00 AM
const CLOSE_HOUR = 21; // 9:00 PM
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 3;
const ASAP_ESTIMATE_MIN = 25;
const ASAP_ESTIMATE_MAX = 40;

const formatDayLabel = (date, index) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (date) =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

// Formats a Date as a Java LocalDateTime-compatible string: no timezone,
// no offset, no milliseconds — e.g. "2026-08-20T14:00:00".
const toLocalDateTimeString = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
};

// Builds the list of selectable days, each with its own list of time slots.
const buildDays = () => {
  const now = new Date();
  const days = [];

  for (let d = 0; d < DAYS_AHEAD; d++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + d);
    dayDate.setHours(0, 0, 0, 0);

    const slots = [];
    for (let minutes = OPEN_HOUR * 60; minutes < CLOSE_HOUR * 60; minutes += SLOT_MINUTES) {
      const slotStart = new Date(dayDate);
      slotStart.setMinutes(minutes);
      // Only today's slots can be in the past; require at least 45 min lead time.
      const isPast = d === 0 && slotStart.getTime() < now.getTime() + 45 * 60 * 1000;

      slots.push({
        date: slotStart,
        label: formatTime(slotStart),
        value: toLocalDateTimeString(slotStart),
        disabled: isPast,
      });
    }

    days.push({
      id: `day-${d}`,
      label: formatDayLabel(dayDate, d),
      slots,
    });
  }

  return days;
};

/**
 * TimeSelector
 *
 * Two-card toggle: "Now" or "Schedule". Picking "Schedule" opens a bottom
 * sheet with day tabs and specific time slots.
 *
 * Single piece of controlled state: `scheduledTime`.
 *  - null            → "Now" is selected
 *  - LocalDateTime string (e.g. "2026-08-20T14:00:00") → that slot is selected
 *
 * props:
 *  - scheduledTime: string | null
 *  - setScheduledTime: (value: string | null) => void
 */
const TimeSelector = ({ scheduledTime, setScheduledTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const days = useMemo(() => buildDays(), []);
  const [activeDayId, setActiveDayId] = useState(days[0]?.id);

  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0];
  const isScheduled = Boolean(scheduledTime);

  console.log("Scheduled time: ", scheduledTime);
  const handlePickNow = () => {
    setScheduledTime(null);
    setIsOpen(false);
  };


  const handlePickSlot = (slot) => {
    if (slot.disabled) return;
    setScheduledTime(slot.value);
    setIsOpen(false);
  };

  const scheduleSubtitle = isScheduled
    ? new Date(scheduledTime).toLocaleString(undefined, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Pick a day & time';

  return (
    <div className="mt-10">
      <h2 className="mb-3 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Delivery time</h2>

      {/* Now / Schedule toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handlePickNow}
          className={`rounded-md border-2 bg-white p-4 text-left shadow-sm transition-colors ${
            !isScheduled ? 'border-[#A65A34]' : 'border-[#E7DCC9] hover:border-[#D8C6AA]'
          }`}
        >
          <p className="text-sm font-medium text-[#3B2A20]">Now</p>
          <p className="text-xs text-[#8A7862]">{ASAP_ESTIMATE_MIN}-{ASAP_ESTIMATE_MAX} min</p>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`rounded-md border-2 bg-white p-4 text-left shadow-sm transition-colors ${
            isScheduled ? 'border-[#A65A34]' : 'border-[#E7DCC9] hover:border-[#D8C6AA]'
          }`}
        >
          <p className="text-sm font-medium text-[#3B2A20]">Schedule</p>
          <p className="text-xs text-[#8A7862]">{scheduleSubtitle}</p>
        </button>
      </div>

      {/* Bottom sheet — only reachable via the Schedule card */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-[#F7F1E8] sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DCC9] px-5 py-4">
              <h3 className="font-['Fraunces',serif] text-lg font-semibold text-[#3B2A20]">Schedule delivery</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-[#8A7862] hover:text-[#3B2A20]"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Day tabs */}
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveDayId(day.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeDayId === day.id
                        ? 'border-[#A65A34] bg-[#A65A34] text-white'
                        : 'border-[#E7DCC9] bg-white text-[#3B2A20] hover:border-[#D8C6AA]'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Time slot grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activeDay.slots.map((slot) => {
                  const isSelected = scheduledTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={slot.disabled}
                      onClick={() => handlePickSlot(slot)}
                      className={`rounded-md border px-2 py-2 text-center text-xs font-medium transition-colors ${
                        slot.disabled
                          ? 'cursor-not-allowed border-[#E7DCC9] bg-[#FBF6EE] text-[#C8B9A3]'
                          : isSelected
                          ? 'border-[#A65A34] bg-[#A65A34] text-white'
                          : 'border-[#E7DCC9] bg-white text-[#3B2A20] hover:border-[#D8C6AA]'
                      }`}
                    >
                      {slot.label}
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

export default TimeSelector;