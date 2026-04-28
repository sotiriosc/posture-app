# Praxis for Gyms: Local SaaS Demo

This branch is a protected sandbox for testing a gym-facing SaaS direction without disrupting the current Praxis consumer product.

## What this demo proves

Praxis can be positioned as a white-label training layer for gyms:

- Member onboarding
- Equipment-aware programming
- Trainer-consistent coaching language
- Exercise substitutions when equipment is unavailable
- Education-first path toward personal training support

The core pitch:

> Turn your gym floor into a personalized training system.

## Current demo route

Visit:

```txt
/gym-demo
```

The current example uses a local gym-style profile inspired by a Richmond Hill facility. The page is intentionally generic enough to swap the brand, equipment list, copy, and sample plan later.

## What was intentionally not changed

This branch does not change:

- Program generator logic
- Progression logic
- Phase gating
- Existing Praxis homepage flow
- Existing assessment flow
- Existing questionnaire flow
- Existing session flow
- Existing database behavior

## Why this should remain separate from main

The gym SaaS direction needs multi-tenant architecture, gym equipment inventory, staff/admin permissions, and branded member onboarding. Those are product-shell concerns that should not be forced into the current consumer Praxis app until the direction is validated.

Recommended long-term shape:

```txt
praxis-engine
  shared movement/programming intelligence

praxis-app
  current consumer product

praxis-gym-saas
  white-label gym product
```

## Local gym MVP scope

### Gym owner view

- Gym profile
- Equipment inventory
- Branding settings
- QR/member invite link
- Member activity summary
- Basic conversion and retention signals

### Member view

- Quick onboarding
- Goal, schedule, limitation, and experience inputs
- Program generated around that gym's actual equipment
- Substitutions when equipment is busy or unavailable
- Workout logging
- Simple education cards explaining why each block exists

### Trainer view

- Review generated plans
- Approve or edit plans
- Shared cue library
- Client readiness notes
- Consistent standards across staff

## First sales message

> We built a system that creates personalized training plans around the equipment inside your gym. Members get a clear plan instead of wandering. Trainers get consistent coaching language. Owners get better engagement, stronger retention, and a clean bridge toward personal training.

## Next technical steps

1. Keep this branch isolated.
2. Preview `/gym-demo` locally.
3. Take screenshots for outreach.
4. Add a simple gym-equipment editor mock.
5. Add a member onboarding demo.
6. Later, split into a clean `praxis-gym-saas` repo if the sales response is positive.

## Suggested validation commands

```bash
npm run lint
npx tsc --noEmit
npm run test:golden
```
