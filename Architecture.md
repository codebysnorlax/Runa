# Runa Application Architecture

This document outlines the software architecture of the Runa application, a modern web-based platform for tracking running activities.

## 1. Core Technology Stack

- **Frontend Framework**: React (v18.2.0)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **Routing**: React Router
- **Authentication**: Clerk

## 2. High-Level Architecture

Runa is a **Single Page Application (SPA)** built on a modular, component-based architecture. The core design philosophy centers around a **decoupled state management system** using React's Context API, ensuring a clear separation of concerns and maintainable code.

The application follows a standard client-side rendering model:
1.  The initial `index.html` loads the Vite-bundled JavaScript.
2.  `main.tsx` serves as the entry point, rendering the root `App` component.
3.  Authentication is handled at the highest level by wrapping the application in Clerk's `ClerkProvider`.
4.  The `App` component sets up routing and wraps the core application logic within a series of context providers.

![High-Level Architecture Diagram](https://mermaid.ink/svg/pako:eNqVVMtqwzAQ_BXXl9S-eOwScAiklFLaIfQytVlYxJYkzgQl_71zEpBKKW_szuzO7G4Xq1GMRn_W9zobD4-XfH5-k-U8L6t8rS49qfC29gS-V2B-p7zZtqX1eUaJ3MKy692g42FzDq_G6L3OxtzWc2g1Nodr2fWlDlt_S4F7_fWwL8Yv-z67WnC8j0X1tO3p8D4mB6uW1Tqg21iQ6E6-b7iS_nFm33-fN02X8bL5pYvS8c8k4jF2q90M-Gk1J6L4_D62g5r_bNlXn9pLq5R5j2jPqG3E-e1J-9cQjYmGk7yN0b6nJ9g000zF571O6-0H57XJ5WkM9bHk5k3mR9L57yPzB_Rz-2O6B4136S1-0pY-qL9qS_iE_x-b-E4Xo7P9l7N7Xk7Q9jHq9t0eP-uH5tqU7S94j7dGz89vjDqL51rR5-J-2G-wI8nC8b5-P0P-E7qV57W-M3vU8h_f4s4Qz-8O74jR3oM3zFf1zO6R5lXW27JzFPEY_57r6U127d14nFqF6n6RfnW5H_eGvBfL1P8LhYJc)

```mermaid
graph TD
    subgraph Browser
        A[index.html] --> B{main.tsx};
    end

    subgraph React Application
        B --> C[ClerkProvider];
        C --> D[App.tsx];
        D --> E[AppProviders];
        E --> F[Router];
    end

    subgraph State Management
        E -- Composes --> G[AppCoreContext];
        E -- Composes --> H[ProfileContext];
        E -- Composes --> I[RunsContext];
        E -- Composes --> J[GoalsContext];
        E -- Composes --> K[InsightsContext];
    end

    subgraph Services
        L[storageService.ts]
    end

    subgraph UI
        M[Pages & Components]
    end

    F --> M;
    M -- Consumes --> G;
    M -- Consumes --> H;
    M -- Consumes --> I;
    M -- Consumes --> J;
    M -- Consumes --> K;

    G -- Uses --> L;
    H -- Uses --> L;
    I -- Uses --> L;
    J -- Uses --> L;
    K -- Uses --> L;

    style L fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px
```

## 3. Key Architectural Components

### 3.1. State Management: Context API

The application avoids external state management libraries like Redux or Zustand in favor of a pure React solution. State is divided into logical domains, with each domain managed by its own Context Provider.

-   **`AppProviders.tsx`**: This is the cornerstone of the state management system. It acts as a composition root, wrapping its children with all the necessary providers in the correct order. This ensures that any component in the tree can access any piece of state it needs.

-   **Context Domains**:
    -   **`AppCoreContext`**: Manages global concerns, such as the loading state and data refresh logic. It listens for authentication changes from Clerk and triggers a global data refresh event.
    -   **`ProfileContext`**: Manages user profile information (name, gender, etc.).
    -   **`RunsContext`**: Manages the list of all running activities.
    -   **`GoalsContext`**: Manages user-defined running goals.
    -   **`InsightsContext`**: Manages AI-generated insights based on running data.

### 3.2. Data Persistence: `storageService.ts`

**`storageService.ts` is a critical architectural component that centralizes all data persistence.** Instead of letting each context manage its own storage, this service provides a unified API for all `localStorage` interactions.

-   **Single Source of Truth**: All application data (profile, runs, goals) is stored in the browser's `localStorage`. This service is the *only* module that reads from or writes to `localStorage`.
-   **Decoupling**: The context providers are decoupled from the storage mechanism. They simply call functions from `storageService` (e.g., `saveRuns(runs)`, `getProfile()`), without needing to know the implementation details. This makes the architecture more modular and easier to refactor (e.g., to switch to a cloud-based backend).
-   **Initialization**: The service handles the initial setup for new users, ensuring that the `localStorage` has a default structure.

### 3.3. Data Synchronization: Custom Events

To prevent tight coupling between different state contexts, the application uses a custom browser event (`appDataRefresh`) for data synchronization.

1.  The `AppCoreContext` listens for changes in the authentication state via Clerk's `useUser` hook.
2.  When a user logs in or out, or when a manual refresh is triggered, `AppCoreContext` dispatches a `CustomEvent` named `appDataRefresh` on the `window` object.
3.  All other data contexts (`ProfileContext`, `RunsContext`, etc.) have event listeners that wait for this event.
4.  Upon receiving the event, each context re-reads its data from the `storageService`.

This event-driven approach ensures that all parts of the application have the most up-to-date data without needing direct references to each other.

### 3.4. Components and UI

-   **`pages/`**: Contains top-level components that correspond to application routes (e.g., `Dashboard.tsx`, `Analytics.tsx`). These are lazy-loaded in `App.tsx` to improve initial load times.
-   **`components/`**: Contains reusable UI elements, from atomic components (`InputField.tsx`, `Card.tsx`) to more complex, feature-specific ones (`RunForm.tsx`, `StreakHeatmap.tsx`).
-   **`hooks/`**: Contains custom hooks that encapsulate complex logic, such as data fetching (`useAnalyticsData.ts`) or UI animations (`useAudioVisualizer.ts`).

### 3.5. Services

-   **`aiService.ts`**: Responsible for interacting with an external AI service to generate insights about the user's runs.
-   **`storageService.ts`**: As described above, handles all data persistence.
-   **Notification Services (`emailService.ts`, `telegramService.ts`)**: Encapsulate logic for sending notifications through different channels.

## 4. Authentication and Routing

-   **`ProtectedRoute.tsx`**: This component wraps routes that require an authenticated user. It uses Clerk's hooks to check the user's session status and redirects to the login page if the user is not authenticated.
-   **`Login.tsx`**: The public-facing login page, which likely utilizes Clerk's pre-built UI components for the sign-in and sign-up process.
-   **`App.tsx`**: Defines the application's routes using `react-router-dom`, associating paths with their corresponding page components and applying lazy loading and protection logic.
