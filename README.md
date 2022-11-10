# Front-end

- React Query
- Zod
- React Hook Form

# Back-end

## Register

[x] Create user (username, name)
  [x] User can be already taken
    [x] Otherwise, return an error
[x] Connect google calendar
  [x] When registered with Google, save user avatar the profile
[x] Add time intervals
  [x] User should not be able to submit this without any valid dates/times
[x] Update profile

## Schedule

[x] Fetch available dates from user (per month)
[x] Fetch available times from user (per date)
[x] Create schedule (user, name, e-mail, observations)
  - [x] Attach to Google Calendar

# Notes (to-do)

[ ] Tests (e2e)

## Challenges

[ ] Save calendar day/time on URL (so share is easier)
[ ] Only load calendar when blocked dates request finishes
[ ] Upload image

## Next.js 13 (Not stable, risky)

[ ] Move to `@next/font` (still buggy, can't easily load non-flex webfonts)
[ ] Move to Next.js 13 layouts on Register pages (still very buggy, not stable at all)
[ ] Use Satori to generate schedule og:images (risky as we would have to use data proxy on Prisma as satori only runs on edge)

