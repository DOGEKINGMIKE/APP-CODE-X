import React, { useState } from 'react';
import { Search, X, ChevronDown, ChevronUp, CaseSensitive, Regex } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchReplaceBarProps {
  onSearch: (query: string, options: { caseSensitive: boolean; regex: boolean }) => void;
  onReplace: (search: string, replace: string, all: boolean) => void;
  onClose: () => void;
  matchCount?: number;
}

const SearchReplaceBar: React.FC<SearchReplaceBarProps> = ({ onSearch, onReplace, onClose, matchCount = 0 }) => {
  const [searchValue, setSearchValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const handleSearch = (val: string) => {
    setSearchValue(val);
    onSearch(val, { caseSensitive, regex: useRegex });
  };

  return (
    <div className="bg-card border-b border-border px-3 py-1.5 flex flex-col gap-1 shrink-0">
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowReplace(!showReplace)}>
          {showReplace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
        <div className="flex-1 flex items-center gap-1 bg-muted rounded px-2 py-0.5">
          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
          <input value={searchValue} onChange={e => handleSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" autoFocus />
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setCaseSensitive(!caseSensitive); onSearch(searchValue, { caseSensitive: !caseSensitive, regex: useRegex }); }} className={`h-6 w-6 p-0 ${caseSensitive ? 'text-primary bg-primary/20' : 'text-muted-foreground'}`}>
          <CaseSensitive className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setUseRegex(!useRegex); onSearch(searchValue, { caseSensitive, regex: !useRegex }); }} className={`h-6 w-6 p-0 ${useRegex ? 'text-primary bg-primary/20' : 'text-muted-foreground'}`}>
          <Regex className="w-3 h-3" />
        </Button>
        {searchValue && <span className="text-[10px] text-muted-foreground">{matchCount} found</span>}
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      {showReplace && (
        <div className="flex items-center gap-1.5 ml-8">
          <div className="flex-1 flex items-center gap-1 bg-muted rounded px-2 py-0.5">
            <input value={replaceValue} onChange={e => setReplaceValue(e.target.value)} placeholder="Replace..." className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onReplace(searchValue, replaceValue, false)}>Replace</Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onReplace(searchValue, replaceValue, true)}>All</Button>
        </div>
      )}
    </div>
  );
};

export default SearchReplaceBar;
