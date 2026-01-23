# PetVerse Application Documentation

This document provides a comprehensive overview of the PetVerse application, its structure, features, and technical details.

## 1. Overview

PetVerse is a modern, full-stack web application designed for pet lovers. It serves as a central hub for pet adoption, accessing expert care guides, a lost and found pet service, and an e-commerce shop for pet supplies. It also includes a complete administrative dashboard for managing users, pets, and content, as well as a real-time messaging system and an AI-powered chatbot assistant.

### Key Features:

-   **Pet Adoption:** Browse and filter adoptable pets, view detailed profiles.
-   **User Profiles:** Users can register, log in, manage their profiles, and see pets they've submitted.
-   **Know Your Pet:** An educational section to learn about different pet breeds and species, powered by AI for discovering new breeds.
-   **Pet Care Guides:** A collection of articles on pet care.
-   **Lost & Found:** Users can report lost or found pets, with AI-powered image analysis to help with identification.
-   **E-commerce Shop:** A dedicated section for purchasing pet food, toys, accessories, and bedding.
-   **Admin Dashboard:** A role-protected area for administrators to manage users (roles, status), blog posts, and other application content.
-   **Real-time Messaging:** Users can start conversations with pet owners directly from pet detail pages to inquire about adoption.
-   **AI Chatbot "Billu":** A friendly AI cat companion available in the shop to answer questions and provide a fun user experience.
-   **Firebase Integration:** Utilizes Firebase for authentication and as a Firestore database backend.

## 2. Tech Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with shadcn/ui components
-   **Generative AI:** Google's Genkit for AI flows (breed info, image analysis, chatbot).
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
| Blog                       | `/blog`                                       | Lists all published blog posts.                                             |
| Blog Post Detail           | `/blog/[id]`                                  | Displays a single, detailed blog post.                                      |
| Pet Care Guides            | `/care`                                       | Lists all available pet care guides.                                        |
| Pet Care Guide Detail      | `/care/[id]`                                  | Displays a single, detailed pet care guide.                                 |
| Know Your Pet              | `/know-your-pet`                              | The main entry point to explore different pet categories and species.       |
| Know Your Pet - Species    | `/know-your-pet/[category]/[petType]`         | Displays all breeds for a specific pet type (e.g., Dogs).                   |
| Lost & Found               | `/lost-and-found`                             | A page to report a lost/found pet or search existing reports.               |
| About Us                   | `/about`                                      | Provides information about the PetVerse mission and vision.                 |
| Contact Us                 | `/contact`                                    | A contact form and business information page.                               |
| FAQ                        | `/faq`                                        | A list of frequently asked questions about adoption, the shop, and more.    |
| Login                      | `/login`                                      | User login page with email/password and Google sign-in options.             |
| Register                   | `/register`                                   | User registration page.                                                     |
| User Profile               | `/profile`                                    | User's personal profile page to manage submitted pets and favorite breeds.  |
| **Shop Section**           |                                               |                                                                             |
| Shop Home                  | `/shop`                                       | The main landing page for the e-commerce section.                           |
| All Products               | `/shop/products`                              | Displays all products with filtering options.                               |
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
| `getSpeciesData`                     | `src/app/know-your-pet/[category]/[petType]/actions.ts`   | Fetches data for a specific pet species, merging its static breed list with any additional breeds found in the `animalBreeds` Firestore collection. |
| `handleLostPetReport`                | `src/app/lost-and-found/actions.ts`                       | Takes a pet image data URI, passes it to the `analyzePetImageForMatching` Genkit flow, and returns the AI-generated analysis summary. |
| `analyzePetImageForMatching` (Flow)  | `src/ai/flows/analyze-pet-image-for-matching.ts`          | A Genkit flow that receives a pet image and uses a multimodal AI model to generate a descriptive summary of the pet's attributes.      |
| `fetchBreedInfo` (Flow)              | `src/ai/flows/fetch-breed-info.ts`                        | A Genkit flow that takes a breed and species name, uses an AI model to research it, and saves the detailed information to Firestore.  |
| `billuChatbot` (Flow)                | `src/ai/flows/billu-chatbot.ts`                           | A Genkit flow that powers Billu, the friendly AI cat chatbot, providing conversational and helpful responses.                        |

---

## 6. Firestore Data and Security

The application leverages Firestore for its database needs, with a strict security model to protect user data while allowing public access to community content.

### Security Rules Summary

The `firestore.rules` file enforces a user-centric security model. Key principles include:
-   **Strict Ownership:** Users can only write to their own data, primarily located under `/users/{userId}`.
-   **Role-Based Access Control (RBAC):** Admins and Superadmins have elevated privileges to manage users and content.
-   **Public Read, Owner Write:** Collections like `/pets` and `/blogs` are publicly readable, but write operations are restricted to the document owner or an admin.
-   **Authentication Required for Writes:** Most write operations require the user to be signed in and have an "Active" status.
-   **Secure Queries:** Rules are structured to enforce secure queries, such as only allowing a user to list conversations they are a participant in.

### Firestore Data Collections

| Collection Path                               | Description                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/users/{userId}`                             | Stores public-facing user profile information. Document ID is the Firebase Auth UID.                                 |
| `/users/{userId}/favoriteBreeds`              | A subcollection storing a user's favorited breeds.                                                                 |
| `/pets/{petId}`                               | A top-level collection of all pets submitted for adoption by users.                                                  |
| `/blogs/{blogId}`                             | Stores all blog posts created by admins or authors.                                                                |
| `/activities/{activityId}`                    | A log of all administrative actions taken within the admin dashboard for auditing purposes.                          |
| `/animalBreeds/{breedId}`                     | Stores detailed information about pet breeds, primarily populated by the `fetchBreedInfo` AI flow.                   |
| `/products/{productId}`                       | A collection of all products available in the e-commerce shop.                                                     |
| `/categories/{categoryId}`                    | Stores categories for blogs and other content.                                                                     |
| `/vet_services/{serviceId}`                   | A collection for veterinary service listings.                                                                      |
| `/lost_found_reports/{reportId}`              | A collection for storing lost and found pet reports.                                                               |
| `/conversations/{conversationId}`             | Stores metadata for a chat between two users, including participant IDs and the last message summary.              |
| `/conversations/{conversationId}/messages/{messageId}` | A subcollection containing all the individual messages for a specific conversation. Write access is limited to participants. |
| `/notifications/{notificationId}`             | Stores global notifications for events like adoptions, visible to all users.                                       |


## 7. GenAI and Chat Features

### Billu the AI Chatbot

PetVerse features "Billu," a playful and helpful AI cat companion available in the PetShop section.
-   **Functionality:** Billu can answer questions about pets, provide information about products, or engage in friendly chat.
-   **Personality:** Billu's personality is cute and friendly, often using cat-related puns and emojis (🐾, 😺).
-   **Implementation:** The chatbot is powered by the `billuChatbot` Genkit flow located in `src/ai/flows/billu-chatbot.ts`. It uses a specifically crafted prompt to define its persona and behavior.

### Real-time Messaging System

To facilitate communication between users for pet adoptions, a real-time messaging system is implemented.
-   **Initiation:** Users can start a chat with a pet's owner directly from the pet detail dialog.
-   **Presence:** The system includes a presence feature, showing whether a user is "Online" or their "last seen" status, based on their interaction with the chat panel.
-   **Implementation:** The chat functionality is managed by a global `useChatStore` (Zustand) and several React components in `src/components/chat/`. It uses Firestore's real-time listeners (`onSnapshot`) to get new messages and conversation updates instantly.

