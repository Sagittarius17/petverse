
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchBreedInfo, FetchBreedInfoInput } from '@/ai/flows/fetch-breed-info';
import type { PetBreed } from '@/lib/data';
import { useDebounce } from '@/hooks/use-debounce';

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
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce input by 500ms

  useEffect(() => {
    // Create an AbortController to cancel previous requests
    const controller = new AbortController();
    const signal = controller.signal;

    const performAiSearch = async () => {
      const term = debouncedSearchTerm.trim();
      
      // Only search if term is long enough and not already in the list
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
        
        // If the request was not aborted, process the result
        if (!signal.aborted) {
          onBreedFound(newBreedInfo);
          toast({
            title: 'AI Discovery!',
            description: `Found and saved info for ${newBreedInfo.name}.`,
          });
        }

      } catch (error: any) {
        // Don't show an error if the request was aborted by the user
        if (signal.aborted) {
          console.log("Search aborted");
          return;
        }
        
        // Don't show toast for "not a real breed" errors to avoid noise.
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

    // Cleanup function to abort the request if the component unmounts or the term changes
    return () => {
      controller.abort();
    };
  }, [debouncedSearchTerm, existingBreeds, speciesName, categoryName, onBreedFound, toast]);

  return (
    <div className="relative flex w-full items-center space-x-2">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-10" // Add padding for spinner
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
