# TODO - UI Improvements for ScholarSync

## Phase 1: Fix Sidebar SVG visibility
- [ ] Update Sidebar.js to use SVG icons from resources/icons instead of emojis
- [ ] Add proper CSS to set color for SVG icons (currently uses stroke="currentColor" which makes them invisible)
- [ ] Update sidebar CSS to style the SVG icons properly

## Phase 2: Fix Navbar favicon
- [ ] Check and ensure the favicon SVG path is correct in Navbar.js
- [ ] Verify the SVG loads properly

## Phase 3: Improve Dashboard buttons
- [ ] Add proper button styling in Overview.js similar to JoinRequests.js

## Phase 4: Replace native prompt() with better modal
- [ ] Create a custom Modal component for input prompts
- [ ] Replace prompt("University name:") in Overview.js with custom modal
- [ ] Replace prompt("University ID:") in Overview.js with custom modal
