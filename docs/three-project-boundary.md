# Three Related Projects, Kept Separate

This note preserves the product boundary we agreed on: the work can share principles, engine intelligence, and philosophy, but the projects should stay separate so each one can serve its own field cleanly.

## 1. Praxis App

**Purpose:** Serve the individual user.

Praxis is the personal movement and training product. It should stay focused on helping one person assess, train, refine alignment, and progress through clear programming.

Praxis should protect:

- The current consumer product
- The posture-informed training flow
- The assessment and questionnaire paths
- The workout/session experience
- The movement engine and program invariants
- The user's personal relationship with their own body and development

Boundary rule:

> Praxis main stays protected. Gym SaaS experiments do not merge into main unless intentionally approved.

## 2. Praxis for Gyms

**Purpose:** Serve the gym, its members, and its trainers.

Praxis for Gyms is the SaaS product direction. It should be a separate product shell built around the intelligence of Praxis, but shaped for gym owners and facilities.

It should help gyms:

- Map their actual equipment
- Give members clear programs
- Help trial members feel confident
- Support trainer consistency
- Educate clients honestly
- Create a clean bridge toward personal training when a person needs more support

Boundary rule:

> Gym SaaS should become its own app/repo once validated. It can reference Praxis logic, but it should not clutter the consumer Praxis app.

## 3. Framework Architect

**Purpose:** Serve the field of structure, language, systems, and meaning.

Framework Architect is the higher-order architecture project. It is not just fitness. It is about how identity, position, purpose, proportion, relationship, language, and structure affect expression.

It should help build:

- Structured frameworks
- Word fields
- Alignment maps
- Decision architecture
- Meaning-based systems
- A way to translate deep concepts into usable tools

Boundary rule:

> Framework Architect can guide the philosophy and language of the other apps, but it should remain its own system.

## Shared root

The three projects are related by the same living principle:

> Serve the person. Serve the client. Serve the gym. Serve the field.

Each project should carry life by making structure more honest, useful, and nourishing.

Praxis serves the body and the individual path.
Praxis for Gyms serves the facility, trainers, and members.
Framework Architect serves the broader field of meaning, structure, and aligned creation.

## Practical architecture

Recommended long-term shape:

```txt
praxis-app
  consumer product
  individual training and posture refinement

praxis-gym-saas
  gym product
  multi-tenant facility/member/trainer system

framework-architect
  structure product
  language, systems, identity, and alignment architecture

shared packages later if needed
  praxis-engine
  design tokens
  copy/positioning references
  framework vocabulary
```

## Safety commitment

- Do not let the gym SaaS work disrupt Praxis main.
- Do not force Framework Architect into Praxis.
- Do not let the product shells corrupt the engine.
- Keep the engine honest, testable, and useful.
- Let each app serve its own audience while sharing the same root principles.

## Current sandbox

The current gym SaaS work lives only on:

```txt
gym-saas-local-demo
```

It is not merged into main. It is a branch for exploration, outreach, and screenshots.
