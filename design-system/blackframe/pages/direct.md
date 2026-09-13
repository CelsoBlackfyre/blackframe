# Direct

Direct is BlackFrame's private continuation of a mutual Shelf Match. It is not a second public feed and it is not open cold messaging.

## Product rules

- A conversation can begin only after both people choose Connect in Shelf Match.
- A mutual pair has exactly one reusable direct conversation.
- Only the two participants can read or send messages.
- Each participant owns an unread count and last-read timestamp.
- The most recently active conversation appears first.
- Messages are plain text, trimmed, and limited to 2,000 characters.
- Up to three shared shelf titles remain visible as conversation context.

## Responsive structure

- Desktop uses a two-pane workspace: searchable inbox on the left, selected conversation on the right.
- Mobile shows one focus at a time. Opening a conversation replaces the inbox and exposes a clear Back to Direct action.
- The composer stays adjacent to the conversation log. The message log is the only scrolling region in the conversation pane.
- Direct remains in desktop navigation and the five-item mobile bottom bar.

## States

- Empty inbox: explain that conversations start from mutual Shelf Matches and link to Connections.
- No selected conversation: prompt the user to choose one without presenting a dead composer.
- Empty conversation: use shared titles to suggest a respectful opening prompt.
- Sending: disable the send action and retain the draft until success.
- Error: show the server validation message beside the composer or match action.
- Unread: show a numeric badge plus stronger text weight; never rely on accent color alone.

## Accessibility

- Search and message inputs have visible labels.
- The conversation log uses semantic list markup and each timestamp uses a `time` element.
- Ctrl+Enter and Command+Enter submit the composer; the button remains the primary discoverable action.
- Message bubbles have sufficient foreground contrast in both themes and do not depend on left/right position alone: the current user's messages expose an accessible label.

## Refresh behavior

Refresh the inbox and active conversation while the page is visible and online. Pause background refresh during navigation and form submissions.
