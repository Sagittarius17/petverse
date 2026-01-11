
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'Food' | 'Toys' | 'Accessories' | 'Bedding';
    imageId: string;
    rating?: number;
    isFeatured?: boolean;
}

export const allProducts: Product[] = [
    // Food
    { id: 'prod1', name: 'Organic Puppy Kibble', description: 'All-natural, grain-free kibble specially formulated for growing puppies.', price: 59.99, category: 'Food', imageId: 'product-food-1', rating: 5, isFeatured: true },
    { id: 'prod2', name: 'Salmon & Sweet Potato Adult Dog Food', description: 'Rich in omega fatty acids for a healthy coat and skin.', price: 64.99, category: 'Food', imageId: 'product-food-2', rating: 4 },
    { id: 'prod3', name: 'Indoor Cat Formula', description: 'Helps control hairballs and maintain a healthy weight for indoor cats.', price: 49.99, category: 'Food', imageId: 'product-food-3', rating: 4 },
    { id: 'prod4', name: 'Tropical Bird Seed Mix', description: 'A premium blend of seeds, fruits, and nuts for parrots and other large birds.', price: 25.99, category: 'Food', imageId: 'product-food-4', rating: 5 },

    // Toys
    { id: 'prod5', name: 'Durable Squeaky Bone', description: 'A virtually indestructible bone-shaped toy that squeaks to keep your dog engaged.', price: 14.99, category: 'Toys', imageId: 'product-toy-1', rating: 4, isFeatured: true },
    { id: 'prod6', name: 'Catnip-Infused Mouse Trio', description: 'A set of three soft, catnip-filled mice for hours of feline fun.', price: 9.99, category: 'Toys', imageId: 'product-toy-2', rating: 5 },
    { id: 'prod7', name: 'Interactive Dog Puzzle', description: 'A challenging puzzle toy that rewards your dog with treats.', price: 22.99, category: 'Toys', imageId: 'product-toy-3', rating: 5 },
    { id: 'prod8', name: 'Feather Wand Teaser', description: 'The classic feather-on-a-stick toy that cats can\'t resist.', price: 7.99, category: 'Toys', imageId: 'product-toy-4', rating: 4, isFeatured: true },

    // Accessories
    { id: 'prod9', name: 'Reflective Dog Leash', description: 'A sturdy 6-foot leash with reflective stitching for safe nighttime walks.', price: 19.99, category: 'Accessories', imageId: 'product-accessory-1', rating: 5 },
    { id: 'prod10', name: 'Personalized Pet ID Tag', description: 'Custom-engraved ID tag in a variety of shapes and colors.', price: 12.99, category: 'Accessories', imageId: 'product-accessory-2', rating: 4 },
    { id: 'prod11', name: 'Stylish Plaid Bandana', description: 'A soft, stylish bandana to make your pet the talk of the park.', price: 8.99, category: 'Accessories', imageId: 'product-accessory-3', rating: 3, isFeatured: true },
    { id: 'prod12', name: 'Stainless Steel Food Bowls', description: 'A set of two durable, non-slip stainless steel bowls.', price: 24.99, category: 'Accessories', imageId: 'product-accessory-4', rating: 5 },
    
    // Bedding
    { id: 'prod13', name: 'Orthopedic Memory Foam Bed', description: 'Provides ultimate comfort and support for dogs of all ages, especially seniors.', price: 89.99, category: 'Bedding', imageId: 'product-bed-1', rating: 5, isFeatured: true },
    { id: 'prod14', name: 'Cozy Cat Cave', description: 'A warm and enclosed felted wool cave for cats who love to hide.', price: 45.99, category: 'Bedding', imageId: 'product-bed-2', rating: 4 },
    { id: 'prod15', name: 'Washable Crate Mat', description: 'A soft, plush mat that fits standard dog crates and is machine washable.', price: 35.99, category: 'Bedding', imageId: 'product-bed-3', rating: 3 },
    { id: 'prod16', name: 'Elevated Cooling Cot', description: 'Keeps your pet cool and comfortable by allowing air to circulate underneath.', price: 55.99, category: 'Bedding', imageId: 'product-bed-4', rating: 4 },
];
