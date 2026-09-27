# 🛒 CartManager — Smart Grocery Planner & Shopping Companion

A modern, responsive, installable Progressive Web App (PWA) designed to simplify grocery budgeting, aisle navigation, pantry management, and expense tracking.

***Live Site:*** [https://cartmanager.pages.dev/](https://cartmanager.pages.dev/)

---

> ### ⚠️ Project Disclaimer
> **This is strictly a non-commercial, educational hobby project.** 
> **All application architecture, user interface design, logic, and source code in this repository were completely generated using Artificial Intelligence (AI).** It is maintained solely for learning, personal experimentation, and prototyping purposes.

---

## 🌟 Key Features

### 📋 Smart Grocery Planning
- **Smart Quick Add:** Natural-text item parsing (e.g. typing `"Amul Butter 500g 280"` auto-detects quantity, unit, price, and category).
- **Aisle & Category Grouping:** Organizes groceries into intuitive supermarket categories (Produce, Dairy, Pantry, Personal Care, Household, etc.).
- **Budget Tracking:** Set monthly/weekly grocery spending targets with real-time visual progress bars and budget-health indicators.
- **Pantry Staples Quick-Restock:** One-click re-adding of frequently depleted household essentials.

### 🏬 Focus In-Store Shopping Mode
- **Distraction-Free Grocery Walk:** High-contrast, touch-optimized checklist for supermarket aisles.
- **Cart vs. Shelf Separation:** Swipe or tap items to move them into your cart with immediate subtotal updates.
- **Auto-Shrinking Header:** Automatically maximizes vertical screen real estate when scrolling down aisles.
- **Smart Omissions / Forgotten Items Modal:** Alerts you about unchecked items before finishing the trip so nothing gets left behind.

### 📶 100% Offline Capability & PWA
- **Installable on Any Device:** Works seamlessly as a standalone desktop or mobile application across Android, iOS, Windows, macOS, and Linux.
- **Service Worker Pre-caching:** Fully operational inside underground supermarkets and weak-signal areas without requiring an active internet connection.
- **Non-Intrusive Offline Badge:** Elegant status indicators that notify you when running locally without blocking screen elements.

### ☁️ Cloud Sync & Sharing
- **Firebase Authentication & Firestore Sync:** Sign in with Google to back up and synchronize lists across your phone, tablet, and PC.
- **Local-First Architecture:** Keeps data in `localStorage` first, seamlessly syncing to Firestore whenever online.
- **WhatsApp & Text Export:** Formats and shares your grocery checklist directly via WhatsApp or clipboard.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PWA Engine:** `vite-plugin-pwa` (Workbox Service Worker + Web App Manifest)
- **Backend & Persistence:** [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore) + Browser `localStorage`
