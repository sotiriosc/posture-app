# Production Final Sequencing Plan Identity

Generated deterministically from the inactive production Final Session Sequencing kernel.

Plan ID is deterministic from contract ID, sessionIntentId, and executionAttemptId. It excludes order, policy values, transition duration, Prescription dose, current time, random UUID, and Candidate rank.

Revision ID hashes exact versioned input truth: policy reference, every ordering-relevant assignment fact, dependency and final Prescription revisions, semantic equipment realization, explicit transition facts, search policy, evaluationTime, and prior revision. Pre-execution revisions retain one plan ID.
