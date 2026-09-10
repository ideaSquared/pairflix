import {
  Container,
  H1,
  H2,
  PageContainer,
  Typography,
} from '@pairflix/components';
import React from 'react';
import DocumentTitle from '../../components/common/DocumentTitle';
import * as styles from './LegalPage.css';

// Describes what the app actually collects today, based on the schema in packages/db/src/schema.ts
// and docs/db-schema.md -- not a claim about handling this codebase can't verify. Anything the
// business still needs to supply (legal entity, contact address, formal retention/deletion
// commitments) is called out explicitly rather than invented.
const PrivacyPage: React.FC = () => (
  <PageContainer maxWidth="md" padding="lg">
    <DocumentTitle title="Privacy Policy" />
    <Container fluid>
      <H1 gutterBottom>Privacy Policy</H1>
      <Typography variant="body2" className={styles.placeholder} gutterBottom>
        Placeholder content -- Pairflix is pre-launch. This page describes what
        the product actually collects today; it has not been reviewed by counsel
        and does not yet name a legal entity, registered address, or data
        protection contact. Replace the bracketed items below before launch.
      </Typography>

      <section className={styles.section}>
        <H2 gutterBottom>Who we are</H2>
        <Typography variant="body1">
          Pairflix is operated by [Pairflix legal entity name], [registered
          address]. For any privacy question or request, contact [privacy
          contact email].
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>What we collect</H2>
        <ul className={styles.list}>
          <li>
            <Typography variant="body1">
              Account details: email, username, and a salted password hash (we
              never store your password itself). Optional two-factor
              authentication secret if you enable it.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Preferences: theme, view style, email-notification setting,
              favorite genres, and your household&apos;s streaming providers.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Household data: who you&apos;re paired with, invite links you send
              or accept.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Taste data: the genres and swipes from onboarding, and the
              mood/thumbs-up-or-down feedback you give on watched titles -- used
              to power your household&apos;s picks.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Pick and viewing activity: what was proposed, swapped, dismissed,
              or watched together, and when.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Security metadata: the IP address, device, and browser used at
              login (kept for account-security purposes only and never shown
              back to you), plus failed sign-in attempts.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Session cookies: an opaque session token and a CSRF token, both
              required to keep you signed in and to protect your account against
              cross-site request forgery.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Subscription status: whether your household is on the free or
              premium tier. Once real billing is live, payment details are held
              by Stripe, not by Pairflix -- billing is not yet live.
            </Typography>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Third parties</H2>
        <Typography variant="body1" gutterBottom>
          Title, poster, and streaming-availability data comes from TMDb. This
          product uses the TMDb API but is not endorsed or certified by TMDb.
        </Typography>
        <Typography variant="body1" gutterBottom>
          If your household opts into the premium &quot;smarter picks&quot;
          feature, a short summary of your taste profile is sent to
          Anthropic&apos;s API to re-rank candidates. This is off by default and
          only ever used for households that turn it on.
        </Typography>
        <Typography variant="body1">
          Once real billing is live, Stripe processes payments and holds your
          payment details -- Pairflix never sees or stores your card number.
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Retention</H2>
        <Typography variant="body1">
          Sessions are deleted once they expire; sign-in rate-limit records are
          kept for 1 day; daily pick-usage records are kept for 2 days.
          [Retention periods for account and activity data beyond these are
          still to be decided by the business.]
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Your choices</H2>
        <Typography variant="body1">
          There is currently no self-service way to export or delete your
          account from the app. Contact [privacy contact email] to request
          either, and we&apos;ll do it by hand until that flow exists.
        </Typography>
      </section>
    </Container>
  </PageContainer>
);

export default PrivacyPage;
