import React, { useState, useCallback, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Pin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  color: string;
}

interface CalendarPanelProps {
  userId?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(130 60% 50%)',
  'hsl(45 90% 55%)',
];

const CalendarPanel: React.FC<CalendarPanelProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(COLORS[0]);

  // Store events in user_notes with a special prefix for calendar
  useEffect(() => {
    if (!userId) return;
    const loadEvents = async () => {
      const { data } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .like('title', 'CAL:%')
        .order('created_at', { ascending: false });
      if (data) {
        setEvents(data.map(n => {
          const parts = n.title.replace('CAL:', '').split('|');
          return {
            id: n.id,
            date: parts[0] || '',
            title: parts[1] || '',
            color: n.color || COLORS[0],
          };
        }));
      }
    };
    loadEvents();
  }, [userId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const addEvent = useCallback(async () => {
    if (!newEventTitle.trim() || !selectedDate || !userId) return;
    const { data, error } = await supabase.from('user_notes').insert({
      user_id: userId,
      title: `CAL:${selectedDate}|${newEventTitle.trim()}`,
      content: '',
      color: newEventColor,
    }).select().single();
    if (data && !error) {
      setEvents(prev => [...prev, {
        id: data.id,
        date: selectedDate,
        title: newEventTitle.trim(),
        color: newEventColor,
      }]);
      setNewEventTitle('');
    }
  }, [newEventTitle, selectedDate, userId, newEventColor]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!userId) return;
    await supabase.from('user_notes').delete().eq('id', id).eq('user_id', userId);
    setEvents(prev => prev.filter(e => e.id !== id));
  }, [userId]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <CalendarDays className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Calendar</span>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={prevMonth}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-foreground">{monthNames[month]} {year}</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={nextMonth}>
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
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded text-xs relative transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' :
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
          <div className="border-t border-border pt-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>

            {selectedEvents.length === 0 && (
              <p className="text-[10px] text-muted-foreground italic">No events</p>
            )}

            {selectedEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 group">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
                <span className="text-xs text-foreground flex-1 truncate">{ev.title}</span>
                <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add event */}
            {userId && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Input
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addEvent()}
                    placeholder="Add event..."
                    className="h-7 text-xs flex-1"
                  />
                  <Button size="sm" className="h-7 w-7 p-0" onClick={addEvent} disabled={!newEventTitle.trim()}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPanel;
