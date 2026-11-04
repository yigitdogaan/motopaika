# Beceriler (Claude skills)

Ajanların kullandığı hazır beceriler. `.claude/skills/` klasöründe durur, her turda otomatik yüklenir.
Kurulum tarihi: 04.11.2026 16:24. Güncellemek için **Ofis Kurulumu** iş akışını tekrar çalıştır.

| Beceri | Kaynak | Ne işe yarar |
| --- | --- | --- |
| `expo-skill-eval` | [expo/skills](https://github.com/expo/skills) | Evaluate Expo skills in this repo end-to-end - trigger accuracy, generated code quality, and runtime screenshots on iOS simulator and Android emulator via Expo  |
| `expo-migrate-module` | [expo/skills](https://github.com/expo/skills) | Migrate an existing Apple/Swift Expo native module from the Expo Modules API 1.0 definition DSL to the 2.0 macro API (sometimes called v2) while preserving its  |
| `expo-module` | [expo/skills](https://github.com/expo/skills) | Guide for creating and writing Expo native modules and views using the Expo Modules API (Swift, Kotlin, TypeScript). Covers module definition DSL, native views, |
| `eas-observe` | [expo/skills](https://github.com/expo/skills) | Use for anything related to EAS Observe - adding `expo-observe` to an Expo project (AppMetricsRoot/ObserveRoot HOC, markInteractive and ObserveInteractiveMarker |
| `expo-animation` | [expo/skills](https://github.com/expo/skills) | Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs |
| `expo-ui` | [expo/skills](https://github.com/expo/skills) | "Build native UI with the @expo/ui package: real SwiftUI on iOS and Jetpack Compose on Android. Default to @expo/ui for sheets (BottomSheet), pickers, sliders,  |
| `eas-update` | [expo/skills](https://github.com/expo/skills) | "Configure and use EAS Update for over-the-air JavaScript and asset updates with expo-updates and EAS CLI. Use when setting up OTA updates, running eas update:c |
| `expo-router` | [expo/skills](https://github.com/expo/skills) | Navigation and routing for Expo Router. Covers file-based routes, groups and dynamic routes, folder organization, Link with previews and context menus, native S |
| `eas-app-stores` | [expo/skills](https://github.com/expo/skills) | Build and submit iOS and Android apps with EAS to TestFlight, the App Store, or Google Play. Supports Expo and other React Native projects, plus existing native |
| `expo-brownfield` | [expo/skills](https://github.com/expo/skills) | Integrate Expo and React Native into an existing native iOS or Android app. Use for brownfield, embedding a React Native screen in SwiftUI/UIKit or Kotlin, or A |
| `expo-overview` | [expo/skills](https://github.com/expo/skills) | "Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the  |
| `eas-workflows` | [expo/skills](https://github.com/expo/skills) | Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS context, ment |
| `eas-hosting` | [expo/skills](https://github.com/expo/skills) | Deploy Expo websites and Expo Router API routes to EAS Hosting - export the web bundle, run eas deploy for production and PR preview URLs, manage environment se |
| `expo-app-clip` | [expo/skills](https://github.com/expo/skills) | Add an iOS App Clip target to an Expo app. Use when the user mentions App Clip, AASA, apple-app-site-association, appclips, smart app banner, or wants to ship a |
| `expo-dom` | [expo/skills](https://github.com/expo/skills) | Use Expo DOM components to run web code in a webview on native and as-is on web. Migrate web code to native incrementally. For the end-to-end migration of a who |
| `expo-upgrade` | [expo/skills](https://github.com/expo/skills) | Guidelines for upgrading Expo SDK versions and fixing dependency issues |
| `expo-project-structure` | [expo/skills](https://github.com/expo/skills) | Folder structure for a new Expo app. Use when scaffolding or laying out a new Expo project with Expo Router, or deciding where a file should live in one. For ne |
| `expo-data-fetching` | [expo/skills](https://github.com/expo/skills) | Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, React Query, SWR, error handling, caching, offline support |
| `expo-examples` | [expo/skills](https://github.com/expo/skills) | Expo's official example projects - the expo/examples repo of ~70 `with-*` integrations (Stripe, Clerk, Supabase, OpenAI, maps, Reanimated, SQLite, Skia, NativeW |
| `eas-update-insights` | [expo/skills](https://github.com/expo/skills) | "Check the health of published EAS Update: crash rates, install/launch counts, unique users, payload size, and the split between embedded and OTA users per chan |
| `expo-web-to-native` | [expo/skills](https://github.com/expo/skills) | Migrate an existing web React app to a native iOS/Android app with Expo. Use when the user wants to turn a website into a mobile app, port a Next.js/Vite/CRA Re |
| `expo-native-ui` | [expo/skills](https://github.com/expo/skills) | Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, visual effects, gradients, storage, |
| `eas-simulator` | [expo/skills](https://github.com/expo/skills) | "Run and control a user's app on a remote iOS/Android simulator hosted on EAS cloud. Read before running any `eas simulator:*` commands - it has the current syn |
| `expo-design-system` | [expo/skills](https://github.com/expo/skills) | Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable compone |
| `expo-dev-client` | [expo/skills](https://github.com/expo/skills) | Build and distribute Expo development clients locally or via TestFlight for internal testing. For production TestFlight releases and store submission, use the e |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://github.com/supabase/agent-skills) | "Postgres best practices maintained by Supabase, for Postgres running anywhere. Load this skill BEFORE writing or changing anything that lives in a Postgres dat |
| `supabase` | [supabase/agent-skills](https://github.com/supabase/agent-skills) | "Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); client libr |
| `composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |  |
| `react-native-skills` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |  |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site  |
| `verification-before-completion` | [obra/superpowers](https://github.com/obra/superpowers) | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output be |
| `writing-plans` | [obra/superpowers](https://github.com/obra/superpowers) | Use when you have a spec or requirements for a multi-step task, before touching code |
| `test-driven-development` | [obra/superpowers](https://github.com/obra/superpowers) | Use when implementing any feature or bugfix, before writing implementation code |
| `brainstorming` | [obra/superpowers](https://github.com/obra/superpowers) | "You MUST use this before any creative work - creating features, building components, adding functionality, modifying behavior, or planning anything new, in sof |
| `requesting-code-review` | [obra/superpowers](https://github.com/obra/superpowers) | Use when completing tasks, implementing major features, or before merging to verify work meets requirements |
| `receiving-code-review` | [obra/superpowers](https://github.com/obra/superpowers) | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical  |
| `systematic-debugging` | [obra/superpowers](https://github.com/obra/superpowers) | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| `executing-plans` | [obra/superpowers](https://github.com/obra/superpowers) | Use when executing an implementation plan in the current session as the implementer yourself — your human partner chose inline execution, or no subagent tool  |
| `handoff` | [mattpocock/skills](https://github.com/mattpocock/skills) | Compact the current conversation into a handoff document for another agent to pick up. |
| `claude-handoff` | [mattpocock/skills](https://github.com/mattpocock/skills) | Hand the current conversation off to a fresh background agent that picks up the work immediately. |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making ch |
| `karpathy-guidelines` | [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) | Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, s |
