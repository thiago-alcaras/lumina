
# Lumina: The Digital Sanctuary (Github Spec Kit)

Lumina is a high-aesthetic personal planner designed for modern female users. It integrates organization with manifestation through an AI-powered design system.

## 🏰 Monorepo Architecture

This project is structured as a feature-based monorepo for maximum scalability.

```text
/
├── components/         # Design System Core Components (Atom/Molecule level)
├── features/           # Modular application sections (Domain logic)
├── services/           # External API integrations (Gemini, LocalStorage)
├── types.ts            # Global Domain definitions
├── constants.tsx       # Visual System tokens & Icons
└── App.tsx             # Main orchestrator
```

## 🎨 Design System: "Lumina UI"

- **Typography**: Serif (Playfair Display) for elegance, Sans (Plus Jakarta Sans) for clarity.
- **Palette**: `lumina-50` (Cream), `lumina-900` (Espresso), `accent-rose` (Blush).
- **Glassmorphism**: Subtle usage for floating elements and tooltips.

## 🚀 Key Features

1. **Dashboard**: High-level overview with AI insights via Gemini.
2. **Calendar**: monthly/weekly view for appointment tracking.
3. **Style Registry**: A visual lookbook for outfit planning and cataloging.
4. **Vision Board**: Generative manifestation board using `gemini-2.5-flash-image`.
5. **Daily Glow Journal**: Reflection tools for mental wellness.

## 🛠 Setup Instructions

1. **Environment**: Ensure `process.env.API_KEY` is configured in your hosting environment.
2. **Design System**: Use the components in `components/DesignSystem.tsx` to maintain consistency.
3. **Development**:
   - `npm install`
   - `npm run dev`

## 📋 Spec Kit Requirements

- **Mobile First**: All components must be responsive.
- **AI Safety**: Prompts for Vision Board generation are prefixed with aesthetic constraints.
- **Type Safety**: Strictly typed interfaces for all API responses and domain entities.
