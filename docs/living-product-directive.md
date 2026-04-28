# Living Product Directive

This directive orients the related apps without collapsing them into one product.

The work should carry awe, but it must express that awe through proportion: clear boundaries, clean interfaces, honest language, useful systems, and respect for the person using the product.

## The root orientation

> Serve the person. Serve the client. Serve the gym. Serve the field.

This is not a slogan for the interface. It is the architectural orientation beneath the work.

The apps should not try to impress people with complexity. They should help people become more capable, more aware, more supported, and more connected to what they are trying to become.

## Proper proportion

Each project has a distinct vessel:

```txt
Praxis App
  individual movement and training
  one user refining their own body and progression

Praxis for Gyms
  gym-facing SaaS
  facility equipment, member guidance, trainer consistency, and retention

Framework Architect
  structure and meaning system
  language, identity, relationships, fields, and decision architecture
```

The shared root can inform all three, but no product should absorb the role of another.

## What awe means here

Awe does not mean vague mysticism in the UI.

Awe means:

- The product respects the hidden complexity of the body.
- The product makes structure visible without overwhelming the user.
- The product gives people a clear next step instead of more confusion.
- The product treats training as education, not manipulation.
- The product supports trainers instead of pretending they are unnecessary.
- The product uses intelligence to restore agency, not extract dependency.

## Orientation by audience

### Individual user

The user should feel:

- I know what to do next.
- I understand why this matters.
- My body is being respected.
- I can progress without guessing.
- This is guiding me, not controlling me.

### Client

The client should receive:

- Clear instruction
- Safer exercise choices
- Better self-awareness
- Honest progression
- Education that helps them value coaching

### Gym

The gym should gain:

- A more confident member base
- Better facility usage
- Higher-quality onboarding
- Stronger trainer consistency
- A clean bridge from general membership into personal training

### Field

The field should be strengthened by:

- Better language
- Better structure
- Better relationships between expert, client, tool, and environment
- Less confusion disguised as sophistication
- More useful systems that help people participate in their own growth

## Architectural rules

1. Keep the products separate.
2. Share principles before sharing code.
3. Share code only when the boundary is clean.
4. Keep the engine testable and protected.
5. Do not mix sales language into core logic.
6. Do not mix spiritual language into flows where clarity is needed.
7. Let deeper philosophy inform the structure, not obscure it.
8. Every screen should answer: who is this serving, and what is the next honest step?

## Product expression rules

### Praxis App

Praxis should feel personal, precise, and grounding.

It should help a user train, assess, log, recover, and understand their movement without feeling like they are inside a sales funnel.

### Praxis for Gyms

Praxis for Gyms should feel professional, trustworthy, and operational.

It should show owners that this improves onboarding, retention, trainer consistency, and member confidence.

It should show trainers that this supports their craft instead of replacing it.

It should show members that the gym has a plan for them.

### Framework Architect

Framework Architect should feel like a clean system for mapping meaning.

It should handle the deeper language: field, identity, relation, proportion, directive, alignment, and expression.

It can carry more of the philosophical root because that is its proper domain.

## Decision filter

Before adding a feature, ask:

```txt
Which project does this belong to?
Who does it serve first?
Does it strengthen or blur the boundary?
Does it make the next action clearer?
Does it preserve user agency?
Does it honor the engine and the field it serves?
```

If the answer is unclear, the feature should become a note, not code.

## Current status

The gym SaaS work is isolated on:

```txt
gym-saas-local-demo
```

The main Praxis app is not affected.

This file is part of the sandbox architecture refinement and should guide the next step one layer at a time.
