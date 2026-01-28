
'use client';

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { indianCities } from '@/lib/indian-cities';
import { MapPin } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface LocationInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [isFocused, setIsFocused] = React.useState(false);
    const debouncedValue = useDebounce(value, 300);

    React.useEffect(() => {
      if (debouncedValue && isFocused) {
        const filteredCities = indianCities
          .filter(city => city.toLowerCase().includes(debouncedValue.toLowerCase()))
          .slice(0, 5); // Limit suggestions
        setSuggestions(filteredCities);
      } else {
        setSuggestions([]);
      }
    }, [debouncedValue, isFocused]);
    
    const handleSelectSuggestion = (city: string) => {
      onChange(city);
      setSuggestions([]);
    };

    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay blur to allow click on suggestions
          autoComplete="off"
          className={cn('pl-10', className)}
          {...props}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
            <ScrollArea className="max-h-60">
              <ul className="p-1">
                {suggestions.map(city => (
                  <li
                    key={city}
                    onMouseDown={() => handleSelectSuggestion(city)} // Use onMouseDown to prevent blur from firing first
                    className="px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }
);

LocationInput.displayName = 'LocationInput';

export { LocationInput };
