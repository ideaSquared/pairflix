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

// Placeholder terms -- Pairflix is pre-launch alpha with no live billing yet (see CLAUDE.md).
// This exists so the register form and footer have somewhere real to link to; counsel still
// needs to draft the actual terms before launch.
const TermsPage: React.FC = () => (
  <PageContainer maxWidth="md" padding="lg">
    <DocumentTitle title="Terms of Service" />
    <Container fluid>
      <H1 gutterBottom>Terms of Service</H1>
      <Typography variant="body2" className={styles.placeholder} gutterBottom>
        Placeholder content -- Pairflix is pre-launch. These terms have not been
        reviewed by counsel and are not the finished agreement users will accept
        at launch.
      </Typography>

      <section className={styles.section}>
        <H2 gutterBottom>The service</H2>
        <Typography variant="body1">
          Pairflix helps a household agree on one thing to watch tonight. The
          free tier gives a household a limited number of picks per day; the
          premium tier (not yet on sale -- billing is not live) is intended to
          remove that limit.
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Your account</H2>
        <Typography variant="body1">
          You&apos;re responsible for keeping your login credentials secure and
          for activity under your account. Accounts are currently for personal,
          non-commercial use.
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Content and availability</H2>
        <Typography variant="body1">
          Title, poster, and streaming-provider information comes from TMDb and
          is best-effort -- availability is region-locked and can change without
          notice. This product uses the TMDb API but is not endorsed or
          certified by TMDb.
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Changes and termination</H2>
        <Typography variant="body1">
          [The business still needs to define: acceptable-use rules, how
          accounts may be suspended or terminated, liability limits, governing
          law, and the process for changing these terms.]
        </Typography>
      </section>

      <section className={styles.section}>
        <H2 gutterBottom>Contact</H2>
        <Typography variant="body1">
          Questions about these terms: [terms contact email].
        </Typography>
      </section>
    </Container>
  </PageContainer>
);

export default TermsPage;
