# PetVerse Application Documentation

This document provides a comprehensive overview of the PetVerse application, its structure, features, and technical details.

## 1. Overview

PetVerse is a modern, full-stack web application designed for pet lovers. It serves as a central hub for pet adoption, accessing expert care guides, a lost and found pet service, and an e-commerce shop for pet supplies. It also includes a complete administrative dashboard for managing users, pets, and content.

### Key Features:

-   **Pet Adoption:** Browse and filter adoptable pets, view detailed profiles.
-   **User Profiles:** Users can register, log in, manage their profiles, and see pets they've submitted.
-   **Know Your Pet:** An educational section to learn about different pet breeds and species, powered by AI for discovering new breeds.
-   **Pet Care Guides:** A collection of articles on pet care.
-   **Lost & Found:** Users can report lost or found pets, with AI-powered image analysis to help with identification.
-   **E-commerce Shop:** A dedicated section for purchasing pet food, toys, accessories, and bedding.
-   **Admin Dashboard:** A role-protected area for administrators to manage users (roles, status), blog posts, and other application content.
-   **Firebase Integration:** Utilizes Firebase for authentication and as a Firestore database backend.

## 2. Tech Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with shadcn/ui components
-   **Generative AI:** Google's Genkit for AI flows (breed info, image analysis).
-   **Database:** Firestore (Firebase)
-   **Authentication:** Firebase Authentication (Email/Password, Google)

## 3. Project Structure

-   `src/app/`: Contains all the application's pages and layouts, following the Next.js App Router convention.
-   `src/components/`: Shared React components used across the application.
-   `src/lib/`: Core application logic, data definitions, and utility functions.
-   `src/firebase/`: Firebase configuration, providers, and custom hooks (`useUser`, `useCollection`, etc.).
-   `src/ai/`: Houses all Genkit-related code, including AI flows and client-side actions.
-   `docs/`: Contains backend schema definitions (`backend.json`).
-   `firestore.rules`: Security rules for the Firestore database.

## 4. Pages and Routing

Below is a list of all pages within the application and their corresponding routes.

| Page Name                  | Route                                         | Description                                                                 |
| -------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| **Main Application**       |                                               |                                                                             |
| Home                       | `/`                                           | The main landing page of the application.                                   |
| Adoption                   | `/adopt`                                      | Displays a searchable and filterable list of all pets available for adoption. |
| Pet Care Guides            | `/care`                                       | Lists all available pet care guides.                                        |
| Pet Care Guide Detail      | `/care/[id]`                                  | Displays a single, detailed pet care guide.                                 |
| Know Your Pet              | `/know-your-pet`                              | The main entry point to explore different pet categories and species.       |
| Know Your Pet - Species    | `/know-your-pet/[category]/[petType]`         | Displays all breeds for a specific pet type (e.g., Dogs).                   |
| Lost & Found               | `/lost-and-found`                             | A page to report a lost/found pet or search existing reports.               |
| Login                      | `/login`                                      | User login page with email/password and Google sign-in options.             |
| Register                   | `/register`                                   | User registration page.                                                     |
| User Profile               | `/profile`                                    | User's personal profile page to manage submitted pets and favorite breeds.  |
| **Shop Section**           |                                               |                                                                             |
| Shop Home                  | `/shop`                                       | The main landing page for the e-commerce section.                           |
| Shop - Food                | `/shop/food`                                  | Displays all products in the "Food" category.                               |
| Shop - Toys                | `/shop/toys`                                  | Displays all products in the "Toys" category.                               |
| Shop - Accessories         | `/shop/accessories`                           | Displays all products in the "Accessories" category.                        |
| **Admin Section**          |                                               |                                                                             |
| Admin Dashboard            | `/admin`                                      | The main dashboard for administrators with stats and activity logs.         |
| Admin - Blogs              | `/admin/blogs`                                | Interface for creating, editing, and deleting blog posts.                   |
| Admin - Pets               | `/admin/pets`                                 | Interface for managing all pets in the system.                              |
| Admin - Users              | `/admin/users`                                | Interface for managing user roles and statuses.                             |
| Admin - Settings           | `/admin/settings`                             | Page for administrators to manage site-wide settings like appearance.       |

---

## 5. API Endpoints and Server Actions

The application uses Next.js Server Actions, which are functions that run on the server but can be called directly from client components. These act as the primary "API endpoints."

| Endpoint / Action                    | File Path                                                 | Description                                                                                                                              |
| ------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `getPetCategories`                   | `src/app/know-your-pet/[category]/[petType]/actions.ts`   | Fetches all pet categories and merges them with AI-generated breeds stored in the `animalBreeds` Firestore collection.               |
| `handleLostPetReport`                | `src/app/lost-and-found/actions.ts`                       | Takes a pet image data URI, passes it to the `analyzePetImageForMatching` Genkit flow, and returns the AI-generated analysis summary. |
| `analyzePetImageForMatching` (Flow)  | `src/ai/flows/analyze-pet-image-for-matching.ts`          | A Genkit flow that receives a pet image and uses a multimodal AI model to generate a descriptive summary of the pet's attributes.      |
| `fetchBreedInfo` (Flow)              | `src/ai/flows/fetch-breed-info.ts`                        | A Genkit flow that takes a breed and species name, uses an AI model to research it, and saves the detailed information to Firestore.  |

---

## 6. Firestore Data Collections

The application leverages Firestore for its database needs. The main data collections are:

| Collection Path                 | Description                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/users/{userId}`               | Stores public-facing user profile information. Document ID is the Firebase Auth UID.                                 |
| `/users/{userId}/favoriteBreeds`| A subcollection storing a user's favorited breeds.                                                                 |
| `/pets/{petId}`                 | A top-level collection of all pets submitted for adoption by users.                                                  |
| `/blogs/{blogId}`               | Stores all blog posts created by admins or authors.                                                                |
| `/activities/{activityId}`      | A log of all administrative actions taken within the admin dashboard for auditing purposes.                          |
| `/animalBreeds/{breedId}`       | Stores detailed information about pet breeds, primarily populated by the `fetchBreedInfo` AI flow.                   |
| `/products/{productId}`         | A collection of all products available in the e-commerce shop.                                                     |
| `/categories/{categoryId}`      | Stores categories for blogs and other content.                                                                     |
| `/vet_services/{serviceId}`     | A collection for veterinary service listings.                                                                      |
| `/lost_found_reports/{reportId}`| A collection for storing lost and found pet reports.                                                               |

