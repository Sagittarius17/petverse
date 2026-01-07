"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { PetBreed } from '@/lib/data';
import { useToast } from "@/components/ui/use-toast";

interface BreedSearchProps {
  speciesName: string;
  onBreedFound: (newBreed: PetBreed) => void;
}

export default function BreedSearch({ speciesName, onBreedFound }: BreedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/get-breed-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ breed: searchTerm, species: speciesName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Breed not found or an error occurred.');
      }

      const newBreed: PetBreed = await response.json();
      onBreedFound(newBreed);
      setSearchTerm('');
      toast({
        title: "Breed Found!",
        description: `Successfully found and added "${newBreed.name}" to our database.`,
      });

    } catch (err: any) {
      toast({
        title: "Search Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm w-full mb-8">
        <h3 className="text-lg font-semibold mb-2">Can't find a breed?</h3>
        <p className="text-sm text-muted-foreground mb-4">
            If you can't find the breed you're looking for, use our AI-powered search to get information about it. The results will be saved for everyone.
        </p>
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
                type="text" 
                placeholder={`e.g., "Siberian Husky"`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button type="submit" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : <><Search className="h-4 w-4 mr-2" /> Search</>}
            </Button>
        </div>
    </div>
  );
}
