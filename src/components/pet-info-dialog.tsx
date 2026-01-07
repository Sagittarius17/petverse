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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PetBreed } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

interface PetInfoDialogProps {
  pet: PetBreed | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetInfoDialog({ pet, isOpen, onClose }: PetInfoDialogProps) {
  if (!pet) {
    return null;
  }

  const images = pet.imageIds
    .map(id => PlaceHolderImages.find(p => p.id === id))
    .filter(img => !!img);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Side: Animal Photo Carousel */}
          <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-secondary">
            {images.length > 0 ? (
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-64 md:h-[500px]">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            ) : (
               <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image available</p>
                </div>
            )}
          </div>

          {/* Right Side: Information */}
          <div className="w-full md:w-1/2 flex flex-col p-6 overflow-hidden">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-bold font-headline">{pet.name}</DialogTitle>
              <DialogDescription className="text-md">
                {pet.description}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-4">
              <Accordion type="single" collapsible defaultValue={pet.careDetails[0]?.title} className="w-full">
                {pet.careDetails.length > 0 ? pet.careDetails.map((detail) => (
                  <AccordionItem value={detail.title} key={detail.title}>
                    <AccordionTrigger className="text-left font-semibold">{detail.title}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {detail.content}
                    </AccordionContent>
                  </AccordionItem>
                )) : (
                  <p className="text-muted-foreground text-sm">More detailed care information is coming soon for this species!</p>
                )}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
