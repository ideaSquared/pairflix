-- Session ids are now sha256(cookie value). Existing rows hold plaintext cookie values and can no
-- longer match any cookie, so drop them (pre-launch, no production data); users log in again.
DELETE FROM `sessions`;
