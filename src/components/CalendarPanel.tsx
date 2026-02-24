import React, { useState, useCallback, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, ChevronLeft, ChevronRight, Clock, Coffee, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

type EventType = 'schedule' | 'event' | 'dayoff';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  color: string;
  type: EventType;
  time?: string; // HH:MM for schedule events
}

interface CalendarPanelProps {
  userId?: string;
  externalEvents?: CalendarEvent[];
}

const STORAGE_KEY = 'csx11-calendar-events';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(130 60% 50%)',
  'hsl(45 90% 55%)',
];

const EVENT_TYPE_LABELS: Record<EventType, { label: string; icon: React.ReactNode }> = {
  schedule: { label: 'Schedule', icon: <Clock className="w-3 h-3" /> },
  event: { label: 'Event', icon: <CalendarCheck className="w-3 h-3" /> },
  dayoff: { label: 'Day Off', icon: <Coffee className="w-3 h-3" /> },
};

const CalendarPanel: React.FC<CalendarPanelProps> = ({ userId, externalEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(COLORS[0]);
  const [newEventType, setNewEventType] = useState<EventType>('event');
  const [newEventTime, setNewEventTime] = useState('09:00');

  // Load events from Supabase or localStorage
  useEffect(() => {
    const loadLocal = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setEvents(stored);
      } catch { setEvents([]); }
    };

    if (!userId || !isSupabaseConfigured) {
      loadLocal();
      return;
    }

    const loadEvents = async () => {
      const { data } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .like('title', 'CAL:%')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setEvents(data.map(n => {
          const parts = n.title.replace('CAL:', '').split('|');
          return {
            id: n.id,
            date: parts[0] || '',
            title: parts[1] || '',
            color: n.color || COLORS[0],
            type: (parts[2] as EventType) || 'event',
            time: parts[3] || undefined,
          };
        }));
      } else {
        loadLocal();
      }
    };
    loadEvents();
  }, [userId]);

  // Merge external events from AI
  useEffect(() => {
    if (externalEvents && externalEvents.length > 0) {
      setEvents(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newOnes = externalEvents.filter(e => !existingIds.has(e.id));
        if (newOnes.length > 0) {
          const merged = [...prev, ...newOnes];
          saveLocal(merged);
          return merged;
        }
        return prev;
      });
    }
  }, [externalEvents]);

  const saveLocal = (evts: CalendarEvent[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(evts)); } catch {}
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  const isDayOff = (dateStr: string) => events.some(e => e.date === dateStr && e.type === 'dayoff');

  const addEvent = useCallback(async () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    const id = `cal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newEvent: CalendarEvent = {
      id,
      date: selectedDate,
      title: newEventTitle.trim(),
      color: newEventType === 'dayoff' ? 'hsl(var(--destructive))' : newEventColor,
      type: newEventType,
      time: newEventType === 'schedule' ? newEventTime : undefined,
    };

    // Save to Supabase if available
    if (userId && isSupabaseConfigured) {
      const { data, error } = await supabase.from('user_notes').insert({
        user_id: userId,
        title: `CAL:${selectedDate}|${newEvent.title}|${newEvent.type}|${newEvent.time || ''}`,
        content: '',
        color: newEvent.color,
      }).select().single();
      if (data && !error) {
        newEvent.id = data.id;
      }
    }

    const updated = [...events, newEvent];
    setEvents(updated);
    saveLocal(updated);
    setNewEventTitle('');
  }, [newEventTitle, selectedDate, userId, newEventColor, newEventType, newEventTime, events]);

  const deleteEvent = useCallback(async (id: string) => {
    if (userId && isSupabaseConfigured) {
      await supabase.from('user_notes').delete().eq('id', id).eq('user_id', userId);
    }
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveLocal(updated);
  }, [userId, events]);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <CalendarDays className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Calendar</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{events.length} events</span>
      </div>

      <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={prevMonth}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-foreground">{monthNames[month]} {year}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={nextMonth}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = formatDate(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayEvents = getEventsForDate(dateStr);
            const hasDayOff = isDayOff(dateStr);
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded text-xs relative transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' :
                  hasDayOff ? 'bg-destructive/15 text-destructive line-through' :
                  isToday ? 'bg-primary/20 text-primary font-bold' :
                  'text-foreground hover:bg-muted'
                }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className="w-1 h-1 rounded-full" style={{ background: e.color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date events */}
        {selectedDate && (
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>

            {selectedEvents.length === 0 && (
              <p className="text-[10px] text-muted-foreground italic">No events for this day</p>
            )}

            {selectedEvents.map(ev => (
              <div key={ev.id} className={`flex items-center gap-2 px-2 py-1.5 rounded group ${
                ev.type === 'dayoff' ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50'
              }`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
                {ev.type === 'schedule' && ev.time && (
                  <span className="text-[10px] font-mono text-primary shrink-0 bg-primary/10 px-1 rounded">{ev.time}</span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  {EVENT_TYPE_LABELS[ev.type].icon}
                </span>
                <span className="text-xs text-foreground flex-1 truncate">{ev.title}</span>
                <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add event form */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Event type selector */}
              <div className="flex gap-1">
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, { label: string; icon: React.ReactNode }][]).map(([type, { label, icon }]) => (
                  <button
                    key={type}
                    onClick={() => setNewEventType(type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                      newEventType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {newEventType === 'schedule' && (
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    className="w-[90px] bg-input border border-border rounded px-1.5 py-1 text-xs text-foreground shrink-0"
                  />
                )}
                <Input
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                  placeholder={newEventType === 'dayoff' ? 'Reason (optional)...' : 'Add event...'}
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" className="h-7 w-7 p-0 shrink-0" onClick={addEvent} disabled={!newEventTitle.trim() && newEventType !== 'dayoff'}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {newEventType !== 'dayoff' && (
                <div className="flex gap-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewEventColor(c)}
                      className={`w-4 h-4 rounded-full border-2 transition-transform ${newEventColor === c ? 'border-foreground scale-125' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPanel;
