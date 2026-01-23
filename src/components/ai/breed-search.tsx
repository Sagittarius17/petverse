'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PawPrint, Search, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchBreedInfo, FetchBreedInfoInput } from '@/ai/flows/fetch-breed-info';
import type { PetBreed } from '@/lib/data';
import { useDebounce } from '@/hooks/use-debounce';

const loadingMessages = [
    "Asking the pet experts...",
    "Sniffing around the web for info...",
    "Sketching some cute pictures...",
    "Fetching the details...",
    "Unleashing new breed knowledge...",
    "Collaring the information...",
];

interface BreedSearchProps {
  speciesName: string;
  categoryName?: string;
  onBreedFound: (newBreed: PetBreed) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder: string;
  existingBreeds: PetBreed[];
}

export default function BreedSearch({ 
  speciesName, 
  categoryName, 
  onBreedFound, 
  searchTerm, 
  setSearchTerm, 
  placeholder,
  existingBreeds
}: BreedSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce input by 500ms

  // Effect for cycling loading text
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isSearching) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 2500); // Change text every 2.5 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSearching]);

  // Effect for performing the AI search
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const performAiSearch = async () => {
      const term = debouncedSearchTerm.trim();
      
      if (term.length < 3) {
        return;
      }
      
      const breedExists = existingBreeds.some(b => b.name.toLowerCase() === term.toLowerCase());
      if (breedExists) {
        return;
      }

      setIsSearching(true);
      try {
        const input: FetchBreedInfoInput = {
          breedName: term,
          speciesName: speciesName,
          categoryName: categoryName,
        };

        const newBreedInfo = await fetchBreedInfo(input);
        
        if (!signal.aborted) {
          onBreedFound(newBreedInfo);
          toast({
            title: 'AI Discovery!',
            description: `Found and saved info for ${newBreedInfo.name}.`,
          });
        }

      } catch (error: any) {
        if (signal.aborted) {
          console.log("Search aborted");
          return;
        }
        
        if (!error.message.includes('not a recognized breed')) {
          toast({
            variant: 'destructive',
            title: 'AI Search Failed',
            description: error.message || 'An unknown error occurred.',
          });
        }
        console.error("AI search failed:", error.message);
      } finally {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    performAiSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedSearchTerm, existingBreeds, speciesName, categoryName, onBreedFound, toast]);

  return (
    <div className="w-full space-y-2">
      <div className="relative flex w-full items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10"
        />
        {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="relative flex h-5 w-5 items-center justify-center">
                    <div className="absolute h-full w-full animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <PawPrint className="h-3 w-3 text-primary" />
                </div>
            </div>
        )}
      </div>
      {isSearching && (
        <div className="flex items-center justify-center gap-2 h-5">
            <p className="text-sm text-muted-foreground animate-in fade-in duration-500">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
