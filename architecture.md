# Runa Application Architecture

## 1. High-Level Overview

The Runa application is a modern, client-side Single Page Application (SPA) built with **React** and **Vite**. Its architecture is centered around a unified React context (`AppContext`) for state management, with all user data persisted directly in the browser's **`localStorage`**.

Authentication is managed by **Clerk**, which provides a robust framework for user sign-in and session management. A significant feature is the integration with the **Google Gemini API** (`aiService`) to generate personalized AI-driven fitness insights for the user. The UI is built with **TailwindCSS** for styling.

## 2. Core Technologies

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Authentication:** Clerk
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Routing:** `react-router-dom` (using `HashRouter`)
- **UI Components:** Primarily custom-built, with some libraries like `recharts` for charts and `react-hot-toast` for notifications.

## 3. Key Architectural Components

The application is structured into several key directories (`pages`, `components`, `services`, `context`) that create a clear separation of concerns.

### 3.1. State Management: `context/AppContext.tsx`

This is the heart of the application's client-side architecture.

- **`AppContextProvider`**: A React Context Provider that wraps the entire application.
- **Responsibilities**:
    - Holds all major application state: user profile, run history, goals, and AI-generated insights.
    - Loads initial data from `storageService` on startup.
    - Provides all functions to mutate state (e.g., `addRun`, `updateGoals`). Every state change is immediately persisted back to `localStorage` via `storageService`.
- **`useAppContext`**: A custom hook that allows any component in the tree to easily access the application's state and action functions.

### 3.2. Data Persistence: `services/storageService.ts`

This service acts as the application's database layer, abstracting all interactions with the browser's `localStorage`.

- **Key Functions**: `saveJSON`, `loadJSON`.
- **Mechanism**: All data is stored as JSON strings. To support multiple users on the same browser, every `localStorage` key is prefixed with the current user's ID obtained from Clerk (e.g., `user_..._runs`, `user_..._profile`).
- **`initializeDefaults`**: Creates a default data structure for new users.

### 3.3. Routing & Authentication: `App.tsx`

This file is the application's entry point after the root `index.tsx`.

- **`HashRouter`**: Used as the primary router to ensure compatibility with simple static file hosting.
- **Authentication Guarding**:
    - **`<SignedIn>`**: Wraps the main `Layout` and all authenticated routes. This content is only rendered if a user is logged in via Clerk.
    - **`<SignedOut>`**: Wraps the `Login` page, which is only rendered for unauthenticated users.
- **Lazy Loading**: Pages are lazy-loaded using `React.lazy()` to improve initial load performance.

### 3.4. AI Integration: `services/aiService.ts`

This service encapsulates all communication with the Google Gemini API.

- **`generateInsightsAndPlan`**: The core function that constructs a detailed prompt for the AI.
- **Prompt Engineering**: The service sends a structured prompt containing the user's profile, recent run data, and goals. It specifically requests the AI to return a JSON object with a predefined structure (`InsightsData` from `types.ts`).
- **Purpose**: To offload complex analysis and planning to the Gemini model, providing users with personalized feedback and future workout plans based on their performance.

### 3.5. UI Structure: `components/Layout.tsx`

This component defines the primary responsive UI shell for authenticated users.

- **Features**: Contains the main navigation (sidebar for desktop, bottom bar for mobile) and the top header which includes the Clerk `<UserButton />`.
- **`<Outlet />`**: Renders the content of the currently active route (e.g., Dashboard, Analytics, Settings).

### 3.6. Data Models: `types.ts`

This file is the single source of truth for the shape of the application's data.

- **Core Types**: `Run`, `Profile`, `Goal`, `InsightsData`.
- **Importance**: Enforces consistency across the application, from `localStorage` persistence to the props passed to React components and the structure requested from the AI service.

## 4. Data Flow

1.  **App Load**: `AppContextProvider` mounts and uses `storageService` to load all data for the current user ID from `localStorage` into React state.
2.  **User Interaction**: A user performs an action (e.g., adds a new run via the `AddRun` page).
3.  **State Update**: The component calls an action function from `useAppContext` (e.g., `addRun(newRunData)`).
4.  **Persistence**: The `addRun` function in `AppContext` updates its internal state and immediately calls `storageService.saveJSON` to persist the updated list of runs to `localStorage`.
5.  **UI Re-render**: Because the state in `AppContext` has changed, all components subscribed to that state (like the `Dashboard`) automatically re-render to display the new information.

This unidirectional and context-centric data flow, combined with a simple persistence layer, creates a predictable and maintainable architecture for a client-side application.
