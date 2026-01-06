
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PetSpecies } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

interface PetInfoDialogProps {
  pet: PetSpecies | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetInfoDialog({ pet, isOpen, onClose }: PetInfoDialogProps) {
  if (!pet) {
    return null;
  }

  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="relative h-48 w-full rounded-md overflow-hidden mb-4">
             {image && (
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={image.imageHint}
                />
              )}
          </div>
          <DialogTitle className="text-3xl font-bold font-headline">{pet.name}</DialogTitle>
          <DialogDescription className="text-md">
            {pet.description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-6">
          <Accordion type="single" collapsible defaultValue={pet.careDetails[0]?.title} className="w-full">
            {pet.careDetails.length > 0 ? pet.careDetails.map((detail) => (
              <AccordionItem value={detail.title} key={detail.title}>
                <AccordionTrigger>{detail.title}</AccordionTrigger>
                <AccordionContent>
                  {detail.content}
                </AccordionContent>
              </AccordionItem>
            )) : (
              <p className="text-muted-foreground text-sm">More detailed care information is coming soon for this species!</p>
            )}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
