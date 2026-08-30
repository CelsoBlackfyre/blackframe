# Shelf Match page override

This file extends `../MASTER.md` for `/matches`.

## Product purpose

Shelf Match is a friendship and creator-discovery surface, not a romance simulator. Profile fields introduce the person; only structured shelf data changes compatibility. Candidate cards reveal shared titles but never expose the candidate's complete private shelf.

## Layout

- Desktop: one active card stack with a 304px sticky score rail.
- Mobile: one vertical card followed by full-width Pass and Connect controls.
- Connections: responsive two-column list of mutual matches.
- Keep the five-item mobile bottom navigation unchanged; expose Match beside People in the compact header.

## Compatibility model

- 55% collection overlap using shared titles relative to both shelf collections.
- 20% favorites shared by both people.
- 15% matching shelf statuses on shared titles.
- 10% closeness between ratings where both people rated a title.
- Candidates with no shared title are not presented.
- Private profiles are presented only to people who already follow them.
- Profile bio, follower count, post count, and existing popularity do not change the score.

## Interaction

- Drag left to Pass and right to Connect, with a 100px decision threshold.
- Always keep labeled Pass and Connect buttons available for keyboard, screen-reader, and non-gesture use.
- Animate only transform and opacity, then defer to the server as the source of truth.
- Honor `prefers-reduced-motion` by submitting without card choreography.
- Show processing, validation failure, empty shelf, caught-up, no-connections, success, and Undo states.

## Content

- Use “Connect” and “match,” never dating language.
- Explain why the score exists in plain language.
- State that interest remains private until mutual.
- Use real avatars and shared subject cover art; use initials or the shelf icon when media is missing.
