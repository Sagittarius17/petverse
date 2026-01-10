'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronsDown,
  Scissors,
  Stethoscope,
  BookOpen,
  Bone,
  Plane,
  HeartPulse,
  ShoppingCart,
  Building,
  Home,
  Heart,
  Info,
  BookMarked,
  Shield,
  HeartHandshake,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const services = [
  {
    title: 'Pet Care',
    items: [
      {
        title: 'Pet Grooming',
        href: '#',
        description: 'Professional grooming to keep your pet looking and feeling great.',
        icon: Scissors,
      },
      {
        title: 'Consult a Vet',
        href: '#',
        description: 'Connect with certified veterinarians for expert medical advice.',
        icon: Stethoscope,
      },
      {
        title: 'Dog Training',
        href: '#',
        description: 'Obedience and behavior training for a well-behaved companion.',
        icon: Bone,
      },
      {
        title: 'Dog Walking',
        href: '#',
        description: 'Reliable dog walking services to keep your friend active.',
        icon: HeartHandshake,
      },
      {
        title: 'Pet Relocation',
        href: '#',
        description: 'Safe and stress-free relocation services for your pets, worldwide.',
        icon: Plane,
      },
      {
        title: 'Pet Wellness',
        href: '#',
        description: 'Holistic wellness plans including nutrition and preventive care.',
        icon: HeartPulse,
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Online Pet Shop',
        href: '#',
        description: 'Shop for food, toys, and accessories from the comfort of home.',
        icon: ShoppingCart,
      },
      {
        title: 'Pet Boarding',
        href: '#',
        description: 'Safe and comfortable boarding facilities for when you are away.',
        icon: Building,
      },
      {
        title: 'Re-home a Pet',
        href: '#',
        description: 'Find a new loving home for your pet with our re-homing service.',
        icon: Home,
      },
      {
        title: 'Adopt a Pet',
        href: '/adopt',
        description: 'Find your new best friend from our list of adoptable pets.',
        icon: Heart,
      },
      {
        title: 'About Us',
        href: '#',
        description: 'Learn more about our mission, team, and community involvement.',
        icon: Info,
      },

      {
        title: 'Blog',
        href: '#',
        description: 'Read our latest articles on pet care, training, and news.',
        icon: BookMarked,
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        title: 'Report Animal Abuse',
        href: '#',
        description: 'Anonymously report cases of animal cruelty or neglect.',
        icon: Shield,
      },
      {
        title: 'Pet Mating',
        href: '#',
        description: 'Connect with other pet owners for responsible breeding.',
        icon: HeartHandshake,
      },
      {
        title: 'Register Pet for Mating',
        href: '#',
        description: 'List your pet for mating and find the perfect match.',
        icon: UserPlus,
      },
    ],
  },
];

export function ServicesMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] grid-cols-3 gap-x-4 p-4 md:w-[700px] lg:w-[900px]">
              {services.map(category => (
                <div key={category.title} className="flex flex-col">
                  <h3 className="mb-2 text-sm font-medium text-foreground">{category.title}</h3>
                  <div className="flex flex-col gap-1">
                    {category.items.map(item => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'> & { icon: React.ElementType }>(
  ({ className, title, children, icon: Icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-x-2">
              <Icon className="h-5 w-5 text-primary group-hover:text-accent-foreground" />
              <div className="text-sm font-medium leading-none">{title}</div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-accent-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';
