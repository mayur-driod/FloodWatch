# 🌊 FloodLens (FloodWatch) — Real-World Flood Intelligence

> **Status: 🚧 Under Active Development**

FloodLens is a civic-tech project focused on **real-time flood reporting, visualization, and risk awareness**.
It enables citizens to report flooding on the ground and helps communities, volunteers, and authorities better understand **what’s actually happening — street by street**.

This project is currently **under development**, with core features actively being built and refined.

---

## ✨ What is FloodLens?

FloodLens bridges the gap between:

* **What people experience on the ground**, and
* **What official flood alerts often fail to capture**

By combining **crowdsourced inputs**, **intuitive visualization**, and **data-backed analysis**, FloodLens aims to make flood information:

* more **accurate**
* more **actionable**
* and more **accessible**

---

## 🎯 Core Goals

* Enable **easy flood reporting** using mobile devices
* Visualize flooding in a **clear, intuitive way**
* Provide **early signals** for high-risk areas and drainage failures
* Build an **India-first**, city-focused (Bengaluru) solution
* Keep the system **transparent, privacy-conscious, and usable**

---

## 🧩 Key Features (Planned & In Progress)

### 🌍 Interactive Landing Experience

* An animated, interactive globe (powered by **COBe**) as the first impression
* Highlights flood-prone regions conceptually (not live data yet)
* Designed to convey **scale and urgency** without overwhelming users

### 📸 Flood Reporting

* Simple flow to report flooding using:

  * Photos or videos
  * Automatic or manual location input
* Optimized for **mobile-first usage**

### 🗺️ Visualization

* Interactive maps to explore reported flood areas
* Severity indicators (e.g., low → critical)
* Clear, readable UI focused on decision-making

### 👥 Role-Based Dashboards

Different experiences based on user role:

* **Citizens**: submit and track reports
* **Volunteers**: help verify and validate reports
* **Admins**: view trends, severity clusters, and risk zones

### 🧠 Smart Analysis (Planned)

* Flood severity estimation from images
* Pattern recognition across locations and time
* Drainage risk insights (DrainIQ – upcoming)

---

## 🛠️ Tech Stack

### Frontend

* **Next.js (App Router)** with **TypeScript**
* **Tailwind CSS**
* **shadcn/ui** for accessible, consistent UI components
* **COBe** for the interactive globe experience
* **Mapbox** (planned) for map-based visualization

### Authentication

* **NextAuth.js**

  * Session-based authentication
  * Supports phone/email/OAuth flows (configurable)
  * Role-aware session handling

### Backend (In Progress)

* **NestJS** (TypeScript)
* **PostgreSQL** (with spatial support planned)
* **Prisma ORM**

### Other Tools

* GitHub Actions for CI (build + lint)
* Cloud-based media storage (planned)
* Optional edge hardware (Raspberry Pi) for future pilots

---

## 🎨 UI & Design Philosophy

* **Calm, serious, and trustworthy**
* No panic-driven visuals
* Mobile-first and accessible
* Clear hierarchy and minimal cognitive load
* Focused on **real-world usability**, not gimmicks

---

## 🔐 Privacy & Responsibility

FloodLens is designed with care:

* No unnecessary personal data is exposed
* Reports can be anonymized
* Precision of location can be controlled
* Visualizations prioritize safety and context over sensationalism

---

## 🚧 Project Status

FloodLens is currently:

* Under active development
* Evolving in scope and implementation
* Not yet production-ready

Some features described here are **planned** and may change as the project matures.

---

## 🗺️ Roadmap (High-Level)

* ✅ Interactive landing page & hero globe
* 🚧 Report submission flow
* 🚧 Authentication & role-based access
* 🛠️ Map visualization
* 🧠 Flood severity analysis
* 🧪 Pilot testing (Bengaluru-focused)

---

## 🤝 Contributing

This project is currently in an early stage.
Contribution guidelines and issue templates will be added soon.

If you’re interested in:

* civic technology
* geospatial data
* frontend systems
* applied ML for social impact

feel free to follow along or reach out.

---

## 📌 Notes

* **FloodLens / FloodWatch** is a working name
* The scope and implementation details may evolve
* This README reflects the project’s intent and direction, not a finalized product