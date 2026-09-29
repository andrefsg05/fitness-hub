# FitnessHub

**FitnessHub** is a personal mobile fitness tracking application designed to help users log workouts, body metrics, personal records, and daily habits seamlessly. 

Built with an **offline-first** architecture, it functions as a fast, reliable, and distraction-free training diary to track progression, sets, drop sets, personal bests, and body composition over time.

---

## Showcase - MVP

<div align="center">
  <img src="https://raw.githubusercontent.com/andrefsg05/showcasing-assets/main/onboarding_fhub.gif" width="30%" />
  <img src="https://raw.githubusercontent.com/andrefsg05/showcasing-assets/main/workout_fhub.gif" width="30%" />
  <img src="https://raw.githubusercontent.com/andrefsg05/showcasing-assets/main/reminder_fhub.gif" width="30%" />
</div>

---

## Features (Core MVP)

- **Live Workout Tracking:** Start and resume workoutsessions. Log exercises, sets, drop sets, reps, weights, and session notes without losing progress if the app closes.
- **Previous Workout Reference & Import:** Inspect previous exercises and loads for the current routine on the fly via a slide-down drawer, with one-tap exercise importing.
- **Personal Records (PRs) & 1RM Analytics:** Real-time PR detection while logging sets and a dedicated Personal Records screen featuring PR progression history and Estimated One-Rep Max (1RM) calculations using the Epley formula.
- **Workout History & Deep Details:** Review past workouts with a complete breakdown of exercises, loads, drop sets, and notes.
- **Fitness Habits & Reminders:** Set up local notifications for daily fitness habits (creatine, hydration, weigh-ins).
- **Body Weight Logging:** Log body weight updates.

---

## Tech Stack

- **Framework:** React Native with [Expo](https://expo.dev)
- **Routing:** Expo Router
- **Language:** TypeScript
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Database & Persistence:** Local SQLite with Repository Pattern via expo-sqlite
- **Notifications:** expo-notifications for scheduled local device reminders

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup Instructions

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run on your device or emulator**

   Follow the terminal output options to launch the app via:
   - [Expo Go](https://expo.dev/go) app on your physical mobile device
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)

---

## Project Vision

FitnessHub aims to start simple as a clean, reliable offline workout logger, incrementally evolving into a comprehensive platform combining analytics and structured personal health data.

