# Compact Dashboard Redesign

Date: 2026-05-12

## Goal

Redesign the Focus Projects homepage so a normal Mac browser viewport can show the timer, active work, waiting todo items, and compact project status without frequent page-level scrolling.

The selected direction is the A mockup: a slim left navigation rail, a compact global timer strip, a dense task board, and simplified project cards.

## Scope

This change covers the dashboard, global layout shell, timer panel density, project cards, and homepage todo summaries.

It does not change storage keys, backend strategy, route structure, Dock launcher behavior, notification behavior, calendar behavior, or project detail CRUD flows.

## Dashboard Content

The homepage should show two task lanes:

- `In Progress`: all todos across all projects with `status === "in-progress"`.
- `Todo`: all todos across all projects with `status === "todo"`, displayed below In Progress.

Each task card should show:

- status button
- todo title
- project name
- priority
- ddl
- expectedFinishTime when present
- overdue styling when applicable

Sorting should prioritize urgent work:

1. overdue items first
2. high priority before medium before low
3. nearer DDL before later DDL
4. items without DDL last

## Homepage Status Changes

Users should be able to change todo status directly from the homepage by clicking the visible status button.

The existing status cycle remains:

- `todo -> in-progress -> done -> todo`

Expected movement:

- clicking a `todo` badge moves the item into In Progress
- clicking an `in-progress` badge moves the item to done, so it disappears from the homepage task lanes
- done items remain visible in the project detail Done Archive, not on the homepage

The homepage should still include a link or action to open the owning project for detailed editing.

## Project Cards

Project cards on the homepage should be compact. Each card should keep the project name and show only the two operational signals the user requested:

- unfinished todo count, meaning todos whose status is not `done`
- nearest DDL among that project's unfinished todos

The card should remove the previous dashboard stats grid for total todos, completed todos, ideas count, and update timestamp.

Project creation should remain available from the Projects section header or empty state, but the large top create-project strip should be removed from the homepage.

## Layout

The left navigation should become a slim rail on desktop. It can use compact icon-first navigation with tooltips or accessible labels, while keeping route behavior unchanged:

- Dashboard
- Timer anchor
- Projects anchor
- Calendar

On smaller screens, the navigation can collapse into a compact top row.

The main dashboard should use a dense two-column layout on desktop:

- left column: In Progress lane above Todo lane
- right column: compact Projects panel

The layout may use bounded panel scrolling for long lists, so the page itself stays short while still allowing many tasks or projects.

## Timer

The global timer should remain mounted outside route pages so navigation does not reset the countdown.

The visual treatment should become a compact top strip:

- current mode chips: Focus / Short Break / Long Break
- large but smaller timer number
- start / pause / reset controls
- compact duration settings
- today session count

Timer behavior, persistence, and notification logic should stay unchanged.

## Visual Direction

Use a clean research/workspace style:

- light background
- white panels
- subtle borders and shadows
- restrained status colors for mode, priority, overdue, and state
- no marketing hero section
- no decorative blobs or oversized card-heavy landing page treatment

The result should feel like a daily working dashboard rather than a product landing page.

## Implementation Notes

Expected files to touch:

- `src/pages/DashboardPage.tsx`
- `src/components/Layout.tsx`
- `src/components/TimerPanel.tsx`
- `src/components/ProjectCard.tsx`
- `scripts/smoke-check.mjs`
- `README.md`

No new runtime dependency is needed.

## Verification

Automatic checks:

- `npm run build`
- `npm run smoke`

Manual checks:

- homepage shows In Progress and Todo lanes
- clicking a `todo` status button moves it into In Progress
- clicking an `in-progress` status button moves it out of homepage into done
- project cards show unfinished count and nearest DDL only
- homepage fits much more information into one normal Mac browser viewport
- timer still keeps counting while navigating
