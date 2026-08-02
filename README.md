SUFD Admin Dashboard

A modern and responsive Admin Dashboard built using React, TypeScript, and Vite. The application provides a centralized interface for managing operations through an intuitive dashboard with analytics, user management, resource monitoring, and administrative tools.

✨ Features
 Dashboard overview with key metrics
 User and personnel management
 Interactive map integration
 Resource and fleet management
 Analytics and reporting
 History and activity tracking
 Settings and configuration
 Authentication interface
 Responsive and modern UI
 
## 🛠️ Tech Stack

| Technology       | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| **React**        | Building the user interface with reusable components        |
| **TypeScript**   | Static typing for improved code quality and maintainability |
| **Vite**         | Fast development server and optimized production builds     |
| **CSS3**         | Custom styling and responsive layouts                       |
| **Context API**  | Global state management across the application              |
| **HTML5**        | Semantic structure and markup                               |
| **npm**          | Dependency and package management                           |
| **Git & GitHub** | Version control and collaboration                           |

## 📂 Project Structure

```text
sufd-admin-dashboard/
├── public/                  # Static assets
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/              # Images and SVGs
│   ├── components/          # Reusable UI components
│   │   ├── screens/         # Dashboard screens/pages
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── MapComponent.tsx
│   │
│   ├── context/             # Global state management
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

##  Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/tanushree10706/sufd-admin-dashboard.git
```

### 2. Navigate to the project directory

```bash
cd sufd-admin-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Once the server starts, open the URL displayed in your terminal (typically **http://localhost:5173**) in your browser.

---

##  Available Scripts

| Command           | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server with hot reloading.                          |
| `npm run build`   | Builds the application for production.                                          |
| `npm run preview` | Serves the production build locally for preview.                                |
| `npm run lint`    | Runs the linter to identify code quality and formatting issues (if configured). |

---

##  Development Workflow

1. Clone the repository.
2. Install all project dependencies using `npm install`.
3. Start the development server with `npm run dev`.
4. Make your changes in the `src/` directory.
5. Test your changes in the browser.
6. Build the project using `npm run build` before deployment.
