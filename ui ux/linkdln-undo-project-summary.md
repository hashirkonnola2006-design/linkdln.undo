# Project: linkdln.undo

A free, no-pricing networking web app. Tagline: "Unmeet. Rewind. Reconnect." — AI-powered networking for real connections, positioned as an antidote to noisy social platforms like LinkedIn. Contact email: hashirkonnola2006@gmail.com

## Core concept
- Users create/join "Rooms" (live networking events)
- Within a Room, people get sorted into "Jars" — groups by role/interest (e.g. Web Devs, Designers, Founders)
- No public feed, no vanity metrics — just small, relevant groups of people

## Pages built/designed so far
- **Landing page**: hero, live stats (events/people connected/rooms/countries), room search
- **How it works**: kept deliberately minimal — 3 simple steps (create/join Room → get sorted into a Jar → connect directly)
- **Pricing**: intentionally a joke/prank page — shows fake tiers (Free/Pro/Enterprise) but all are $0, since the app is 100% free forever
- **About**: mission/story section + "Get in touch" section with the contact email
- **Settings page**: sections for Appearance & Notifications, Account & Security, Privacy, Data (export/delete account) — explicitly no AI/model config, no billing (not using AI in the product)

## Room-level features (organizer/admin side)
- **Dashboard tab**: stats (total joins, peak traffic, active jars, top performer), joins-over-time chart, jar popularity breakdown
- **Analytics tab**: attendance rate, peak concurrent users, avg session time, hourly engagement heatmap, attendee demographics, CSV export
- Both being enhanced with: clickable/filterable charts, recent activity feed, connection-rate metrics, contextual insight callouts, comparison views, loading/empty states

## In-progress feature: Media tab (Google Drive integration)
- New "Media" tab planned for the room navbar
- Room admin connects a Google Drive folder when creating a room (via OAuth + Google Picker, scoped to `drive.file` — not full Drive access)
- All room participants can view photos/videos from that folder, and use an in-app "Capture" button (camera access via `getUserMedia`) to add new photos/videos, which upload into the admin's Drive folder via the backend using the admin's stored OAuth token
- **Current setup status**: created a Google Cloud project ("linkdln undo"), created an API key restricted to Google Drive API, enabled Google Drive API, configured OAuth consent screen (External, added self as test user, added `drive.file` scope), currently creating the OAuth 2.0 Web application Client ID with redirect URI `http://localhost:5000/api/auth/google/callback`
- Next steps once Client ID + Secret are obtained: give them to the coding agent to implement the OAuth popup flow, backend token exchange + encrypted storage, and actual Drive upload on capture

## Build approach
- Using Google Antigravity (agentic coding tool) to implement changes via detailed prompts
- Building solo, "some experience" skill level — estimated ~8-14 weeks part-time for the full build without AI-assisted coding, largely because OAuth/API console setup (scopes, redirect URIs, consent screens) has been the most time-consuming/error-prone part so far

## Stated preferences
- Don't generate HTML files/artifacts unless explicitly asked
