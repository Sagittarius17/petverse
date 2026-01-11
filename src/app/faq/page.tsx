'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PawPrint } from "lucide-react";

const faqData = [
  {
    id: "item-1",
    question: "What is the adoption process?",
    answer: "Our adoption process is designed to ensure our pets go to loving, permanent homes. It starts with an online application, followed by a meet-and-greet with the pet, a home check (virtual or in-person), and finally, signing the adoption contract and paying the adoption fee."
  },
  {
    id: "item-2",
    question: "How much are the adoption fees?",
    answer: "Adoption fees vary depending on the pet's age, species, and medical needs. The fee typically covers initial vaccinations, spaying/neutering, microchipping, and a health check-up. You can find the specific fee on each pet's profile page."
  },
  {
    id: "item-3",
    question: "Can I return a pet if it's not a good fit?",
    answer: "Yes, we have a return policy. We understand that sometimes a match doesn't work out. We require that the pet be returned to us, and we will work with you to find another pet that may be a better fit for your lifestyle."
  },
  {
    id: "item-4",
    question: "What's included in the PetVerse shop?",
    answer: "Our shop offers a curated selection of high-quality food, fun toys, stylish accessories, and comfortable bedding. All products are tested and approved by our own pets!"
  },
  {
    id: "item-5",
    question: "How does the Lost & Found service work?",
    answer: "You can post a report for a pet you've lost or found. Our system uses AI to analyze the pet's photo to help create a detailed description, increasing the chances of a successful reunion. You can also browse existing reports in your area."
  },
   {
    id: "item-6",
    question: "How can I volunteer or donate?",
    answer: "We're so glad you asked! You can find more information about volunteering opportunities and how to make a donation on our 'Get Involved' page or by contacting us directly. Your support makes a huge difference!"
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-block bg-primary/10 p-4 rounded-full">
            <PawPrint className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold font-headline tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item) => (
            <AccordionItem value={item.id} key={item.id}>
              <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
