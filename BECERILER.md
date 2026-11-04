# Beceriler (Claude skills)

Ajanların kullandığı hazır beceriler. `.claude/skills/` klasöründe durur, her turda otomatik yüklenir.
Son kurulum: 04.11.2026 18:28. Güncellemek için **Ofis Kurulumu** iş akışını tekrar çalıştır.

| Beceri | Kaynak | Ne işe yarar |
| --- | --- | --- |
| `brainstorming` |  | "You MUST use this before any creative work - creating features, building components, adding functionality, modifying behavior, or planning anything new, in sof |
| `claude-handoff` |  | Hand the current conversation off to a fresh background agent that picks up the work immediately. |
| `composition-patterns` |  | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reus |
| `eas-app-stores` |  | Build and submit iOS and Android apps with EAS to TestFlight, the App Store, or Google Play. Supports Expo and other React Native projects, plus existing native |
| `eas-hosting` |  | Deploy Expo websites and Expo Router API routes to EAS Hosting - export the web bundle, run eas deploy for production and PR preview URLs, manage environment se |
| `eas-observe` |  | Use for anything related to EAS Observe - adding `expo-observe` to an Expo project (AppMetricsRoot/ObserveRoot HOC, markInteractive and ObserveInteractiveMarker |
| `eas-simulator` |  | "Run and control a user's app on a remote iOS/Android simulator hosted on EAS cloud. Read before running any `eas simulator:*` commands - it has the current syn |
| `eas-update` |  | "Configure and use EAS Update for over-the-air JavaScript and asset updates with expo-updates and EAS CLI. Use when setting up OTA updates, running eas update:c |
| `eas-update-insights` |  | "Check the health of published EAS Update: crash rates, install/launch counts, unique users, payload size, and the split between embedded and OTA users per chan |
| `eas-workflows` |  | Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS context, ment |
| `executing-plans` |  | Use when executing an implementation plan in the current session as the implementer yourself — your human partner chose inline execution, or no subagent tool is |
| `expo-animation` |  | Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs o |
| `expo-app-clip` |  | Add an iOS App Clip target to an Expo app. Use when the user mentions App Clip, AASA, apple-app-site-association, appclips, smart app banner, or wants to ship a |
| `expo-brownfield` |  | Integrate Expo and React Native into an existing native iOS or Android app. Use for brownfield, embedding a React Native screen in SwiftUI/UIKit or Kotlin, or A |
| `expo-data-fetching` |  | Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, React Query, SWR, error handling, caching, offline support |
| `expo-design-system` |  | Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable compone |
| `expo-dev-client` |  | Build and distribute Expo development clients locally or via TestFlight for internal testing. For production TestFlight releases and store submission, use the e |
| `expo-dom` |  | Use Expo DOM components to run web code in a webview on native and as-is on web. Migrate web code to native incrementally. For the end-to-end migration of a who |
| `expo-examples` |  | Expo's official example projects - the expo/examples repo of ~70 `with-*` integrations (Stripe, Clerk, Supabase, OpenAI, maps, Reanimated, SQLite, Skia, NativeW |
| `expo-migrate-module` |  | Migrate an existing Apple/Swift Expo native module from the Expo Modules API 1.0 definition DSL to the 2.0 macro API (sometimes called v2) while preserving its  |
| `expo-module` |  | Guide for creating and writing Expo native modules and views using the Expo Modules API (Swift, Kotlin, TypeScript). Covers module definition DSL, native views, |
| `expo-native-ui` |  | Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, visual effects, gradients, storage, |
| `expo-overview` |  | "Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the requ |
| `expo-project-structure` |  | Folder structure for a new Expo app. Use when scaffolding or laying out a new Expo project with Expo Router, or deciding where a file should live in one. For ne |
| `expo-router` |  | Navigation and routing for Expo Router. Covers file-based routes, groups and dynamic routes, folder organization, Link with previews and context menus, native S |
| `expo-skill-eval` |  | Evaluate Expo skills in this repo end-to-end - trigger accuracy, generated code quality, and runtime screenshots on iOS simulator and Android emulator via Expo  |
| `expo-ui` |  | "Build native UI with the @expo/ui package: real SwiftUI on iOS and Jetpack Compose on Android. Default to @expo/ui for sheets (BottomSheet), pickers, sliders,  |
| `expo-upgrade` |  | Guidelines for upgrading Expo SDK versions and fixing dependency issues |
| `expo-web-to-native` |  | Migrate an existing web React app to a native iOS/Android app with Expo. Use when the user wants to turn a website into a mobile app, port a Next.js/Vite/CRA Re |
| `frontend-design` |  | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making ch |
| `handoff` |  | Compact the current conversation into a handoff document for another agent to pick up. |
| `karpathy-guidelines` |  | Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, s |
| `ponytail` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Lazy senior dev mode: the smallest change that fully solves the task, and a reply a busy human understands in one read. Use on any coding task (writing, fixing, |
| `ponytail-audit` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Quality audit of a whole repo: bugs, security holes, what breaks under real load, risky code without tests, slow paths, and what to delete, merge or split. Rank |
| `ponytail-debt` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | List every `shortcut:` comment (and older `ponytail:` ones) as a debt ledger. One-shot report, changes nothing. Use for "ponytail debt", "what did ponytail defe |
| `ponytail-gain` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Show ponytail's measured savings (code, cost, speed) from the benchmark. One-shot display. Use for /ponytail-gain, "what does ponytail save", "ponytail impact". |
| `ponytail-help` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Quick reference for ponytail levels, skills and commands. One-shot display. Use for /ponytail-help, "ponytail help", "how do I use ponytail". |
| `ponytail-review` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Quality review of a change: is the logic right, is it safe, does it hold under real load, is risky code tested, is it fast enough, and is every line needed. Rea |
| `react-native-skills` |  | React Native and Expo best practices for building performant mobile apps. Use when building React Native components, optimizing list performance, implementing a |
| `receiving-code-review` |  | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical  |
| `requesting-code-review` |  | Use when completing tasks, implementing major features, or before merging to verify work meets requirements |
| `supabase` |  | "Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); client libr |
| `supabase-postgres-best-practices` |  | "Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres dat |
| `systematic-debugging` |  | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| `test-driven-development` |  | Use when implementing any feature or bugfix, before writing implementation code |
| `verification-before-completion` |  | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output be |
| `web-design-guidelines` |  | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site  |
| `writing-plans` |  | Use when you have a spec or requirements for a multi-step task, before touching code |
