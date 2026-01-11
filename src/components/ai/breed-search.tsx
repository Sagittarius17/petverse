
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchBreedInfo, FetchBreedInfoInput } from '@/ai/flows/fetch-breed-info';
import type { PetBreed } from '@/lib/data';

interface BreedSearchProps {
  speciesName: string;
  categoryName?: string;
  onBreedFound: (newBreed: PetBreed) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder: string;
}

export default function BreedSearch({ speciesName, categoryName, onBreedFound, searchTerm, setSearchTerm, placeholder }: BreedSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Search',
        description: 'Please enter a breed name to search with AI.',
      });
      return;
    }

    setIsSearching(true);

    try {
      const input: FetchBreedInfoInput = {
        breedName: searchTerm,
        speciesName: speciesName,
        categoryName: categoryName,
      };

      // Call the Server Action
      const newBreedInfo = await fetchBreedInfo(input);

      onBreedFound(newBreedInfo);
      
      toast({
        title: 'Breed Found!',
        description: `Successfully fetched and saved information for ${newBreedInfo.name}.`,
      });

    } catch (error: any) {
      console.error('AI search failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: error.message || 'Could not fetch information for this breed. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex w-full items-center space-x-2">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
            />
        </div>
        <Button onClick={handleAiSearch} disabled={isSearching}>
        {isSearching ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
            </>
        ) : (
            <>
                <Wand2 className="mr-2 h-4 w-4" />
                AI Search
            </>
        )}
        </Button>
    </div>
  );
}
