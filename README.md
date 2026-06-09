# KFK React TS — Financial Management Dashboard 📊

A modern, high-performance web-based management and monitoring panel for currency exchange networks and POS terminals. This dashboard acts as the central hub for configuring financial rules, managing live exchange rates, and auditing transaction logs from remote cashier applications.

## 🚀 Key Features

- **Live Rate Management:** Centralized system to update and broadcast commercial exchange rates across the entire terminal network.
- **Transaction & Document Audit:** Real-time stream and filtering of cash orders, cashier checks, and daily close reports (Z-Reports).
- **Network Synchronization:** Automated API communication with endpoints using modern Bearer Token authentication and secure headers.
- **UTC Alignment:** Fully synchronized with the v14.7 database schema, eliminating timezone collisions across distributed branch offices.
- **Clean UI/UX:** Built with a minimalist financial dashboard pattern, smooth data fetching, and optimistic UI rendering.
- **Material Design Architecture:** Powered by MUI component eco-system for reliable data filtering, pixel-perfect layouts, and highly accessible financial widgets.

## 🛠️ Tech Stack

- **Frontend:** React 18+ / React 19
- **Type Safety:** TypeScript
- **Styling & Components:** Material UI (MUI v6) — utilized for enterprise-grade financial tables, smooth pickers, and dashboard layouts.
- **State Management & Routing:** React Router / Context API
- **Build Tool:** Vite

## 📦 Project Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com
   cd kfk-react-ts
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (this file is securely ignored by Git):

   ```env
   VITE_API_URL=https://yourdomain.com
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔒 Security Note

This is the frontend client architecture repository. All sensitive data, including production API tokens, cryptographic credentials, and fiscal signing keys, are strictly managed via runtime environment variables and are never hardcoded into the source code.
