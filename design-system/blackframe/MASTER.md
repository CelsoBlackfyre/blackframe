# BlackFrame Design System

This file is the product-wide visual source of truth. Before building a page, check `design-system/blackframe/pages/<page>.md`. A page file may override this document only where it is explicit.

## Product read

BlackFrame is a culture-aware social web application for sharing life, curating a personal shelf, and meeting people through shared taste. The interface is editorial, content-first, quick to scan, and familiar without copying Instagram or dating-app visual identity.

Design dials:

- Variance: 7/10. Strong editorial hierarchy, cinematic media, and deliberate asymmetry.
- Motion: 5/10. Purposeful entrance, drag, decision, and scroll choreography with reduced-motion parity.
- Density: 6/10. Compact navigation with more breathing room around identity, culture, and compatibility content.

## Tokens

The live token definitions are in `resources/css/app.css`.

| Role             | Light              | Dark               | Notes                                        |
| ---------------- | ------------------ | ------------------ | -------------------------------------------- |
| Background       | `hsl(240 7% 97%)`  | `hsl(240 7% 6%)`   | Neutral canvas                               |
| Card             | `hsl(0 0% 100%)`   | `hsl(240 6% 9%)`   | Posts and raised surfaces                    |
| Foreground       | `hsl(240 6% 10%)`  | `hsl(240 5% 96%)`  | Primary text                                 |
| Muted foreground | `hsl(240 4% 40%)`  | `hsl(240 5% 70%)`  | Must retain 4.5:1 contrast for normal text   |
| Primary          | `hsl(347 77% 50%)` | `hsl(347 80% 62%)` | The only brand accent                        |
| Border           | `hsl(240 5% 88%)`  | `hsl(240 4% 20%)`  | Structural separation                        |
| Destructive      | semantic red       | semantic red       | Never use the brand accent as an error state |

Do not introduce a second decorative accent. Blue is reserved for platform/browser conventions only if needed.

## Typography

- Family: locally bundled Outfit Variable with system sans fallbacks.
- Base: 16px, line height 1.5 or greater.
- Type scale: 12, 14, 16, 18, 24, 32, 48, 64.
- Feed usernames and action counts use 600 weight.
- User content stays at 400 weight and must wrap naturally.
- Avoid serif display faces, oversized social-app headings, and letter-spaced micro-labels.

## Shape and elevation

- Cards and media: 16px radius.
- Buttons and inputs: 12px to 16px radius.
- Avatars: circular because the shape conveys identity.
- Use borders before shadows. A post may use one low-contrast tinted shadow in light mode.
- Modals use a measured scrim and the same radius family.

## Layout

- Mobile first at 375px, then 768px, 1024px, and 1440px.
- Desktop uses persistent left navigation, a feed up to 640px, and an optional 300px discovery rail.
- Mobile uses a compact top brand bar and bottom navigation with no more than five destinations.
- Fixed navigation must reserve content padding, including safe-area insets.
- Avoid nested scrolling and horizontal page overflow. Horizontal creator suggestions are the intentional exception.

## Interaction

- Primary actions have at least 44px visual height in touch contexts.
- Adjacent controls maintain at least 8px spacing.
- Every icon-only control has an accessible name and applicable pressed/expanded state.
- All state changes show feedback within 100ms. Network actions expose a disabled processing state.
- Use Inertia `Link` for internal navigation.
- Preserve feed scroll position for likes and follows.
- Motion is limited to opacity/transform and honors `prefers-reduced-motion`.

## Content and media

- Media is the strongest visual element on feed and profile screens.
- Every meaningful image needs specific alt text. Decorative images use empty alt text.
- Reserve image dimensions to avoid layout shift. Eager-load only the first feed image.
- Seed/demo imagery must be clearly non-production and replaceable through the media service boundary.
- Do not build fake screenshots from decorative divs.

## Required states

Every interactive feature must define loading, success, empty, error, and disabled states. Destructive actions require confirmation or a practical undo route.

Catalog selection uses search-first progressive disclosure: show canonical sourced matches before exposing the moderated missing-title request. Never render the complete catalog as a static select.

People discovery uses one URL-addressable directory with Discover, Followers, and Following views. Search is debounced, case-insensitive, and state-preserving; every card must expose relationship context and an explicit processing state for Follow or Unfollow.

Shelf Match uses real shared shelf data rather than inferred demographics or popularity. A candidate must share at least one title. Compatibility must expose collection overlap, shared favorites, status agreement, and rating closeness. Pass and Connect remain explicit buttons even when drag gestures are available; decisions require a practical Undo route, and a match is shown only after mutual Connect decisions.

Direct messaging is available only between mutual Shelf Matches. A mutual pair reuses one participant-only conversation, unread state belongs to each participant, and shared shelf titles provide context without entering the message body. Desktop uses a two-pane inbox; mobile uses a single-focus conversation with a predictable Back to Direct action.

## Accessibility baseline

- WCAG AA text contrast in both themes.
- Visible 2px focus indicator with at least 3:1 state contrast.
- Logical heading and keyboard order.
- No color-only status communication.
- Sticky navigation must not obscure focused controls.
- Authentication supports paste, autofill, and password managers.

## Icon system

Use Lucide consistently because it is part of the official Laravel React starter. Use 1.8px strokes for standard controls and 2.2px only for selected navigation state. Do not add another icon family.

## Avoid

- Instagram logos, copied wordmarks, or trademarked brand assets.
- Generic glass panels, neon glows, and multiple accent colors.
- Emoji as navigation icons.
- Dead controls for features that have not shipped.
- Hover-only actions and layout-shifting hover transforms.
- Animation without a state, hierarchy, or feedback purpose.
