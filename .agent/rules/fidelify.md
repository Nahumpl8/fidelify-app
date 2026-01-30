---
trigger: always_on
---

/# PROJECT CONTEXT: FIDELIFY (Immersive SaaS)
We are building a high-end Digital Pass Creator.
**DESIGN GOAL:** Shift from a traditional web app layout to an **"Immersive Studio" experience**, inspired by visionOS and futuristic interfaces.

# NEW DESIGN SYSTEM: "AURORA GLASS" (STRICT)

## 1. Global Atmosphere
- **Background:** The entire app (`body`) must be a deep, dark animated gradient ("Aurora"). Use deep purples, blues, and blacks with subtle movement.
- **Depth:** The interface should feel like a 3D space, not a flat 2D page.
- **Typography:** Use a modern, tight font (e.g., 'Inter Tight'). Headers must be bold (weight 800) with tight letter-spacing.

## 2. Glassmorphism Components (Panels, Cards, Inputs)
All UI containers (sidebars, forms, modals) must use strict "Glass" styling:
- **Background:** Very low opacity white/light (e.g., `rgba(255, 255, 255, 0.03)`).
- **Blur:** High backdrop-filter (e.g., `blur(30px) saturate(120%)`).
- **Borders:** Thin, subtle light borders (e.g., `1px solid rgba(255, 255, 255, 0.1)`).
- **Shadows:** Deep, soft shadows to create lift.
- **Hover:** Elements should glow slightly and lift (`translateY(-2px)`) on hover.

## 3. The 3D Hero Element (The Phone)
The Phone Preview is no longer a flat sticky element.
- **Placement:** It floats in the center of the 3D canvas.
- **Effect:** It must use CSS 3D transforms (`perspective`, `rotateY`, `rotateX`) and a gentle floating animation loop.
- **Realism:** It needs realistic lighting reflecting off the screen and frame.

# ARCHITECTURE UPDATES
- **`WizardContainer.jsx`:** NO LONGER a split-screen. It is now a full-screen canvas holding floating Glass panels (Navigation, Config) and the central 3D Phone Hero.
- **`Step2Designer.jsx`:** Must be refactored to live inside a floating Glass Panel, maintaining the "No Scroll/Micro-step" logic but with the new visual style.
- **Functionality:** The underlying React state logic and data binding MUST remain intact. Only the presentation layer changes.