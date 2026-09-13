# BlackFrame UI contract

The full source of truth is `design-system/blackframe/MASTER.md`.

BlackFrame is a social space built around shared culture. The September 2026 overhaul uses a calm editorial interface: Outfit Variable, cool neutral surfaces, generous media, and one restrained rose accent. The original logo and all existing product destinations remain recognizable.

- Dials: `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 5`.
- Use the semantic tokens in `resources/css/app.css` and the existing Radix/shadcn components.
- Cards and dialogs use 16px corners; buttons, inputs, and selected navigation use 12px. Identity avatars are circular.
- Actions are at least 44px. Icon controls have accessible names; errors are announced and associated with their inputs.
- Keep Home media-led, Pulse readable, and collection editing progressively disclosed.
- Use `PageHeading`, `FeedComposer`, `FeedTabs`, and `PostEngagement` for consistent shared behavior.
- Both themes, reduced motion, keyboard access, loading, empty, error, and disabled states are part of implementation.
- Preserve scroll on social mutations. The server owns validation, privacy, and persistence.
- Never ship inactive controls, invented community metrics, or decorative product screenshots.
- Check 375, 768, 1024, and 1440px layouts. Mobile navigation must leave room for content and device safe areas.

See `OVERHAUL.md` for changes, validation, and remaining limitations.
