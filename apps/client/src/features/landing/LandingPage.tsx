import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Flex,
  Grid,
  PageContainer,
  Typography,
} from '@pairflix/components';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOODS } from '../../config/moods';
import type { Mood } from '../../services/api/households';
import RecommendationResultCard from '../tonight/RecommendationResultCard';
import * as styles from './LandingPage.css';
import { useDemoPick } from './useDemoPick';
import { useDemoPickGate } from './useDemoPickGate';

const SignupCta: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.signupCta}>
      <Button
        variant="primary"
        size="large"
        onClick={() => navigate('/register')}
        isFullWidth
      >
        Create a free account
      </Button>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [mood, setMood] = useState<Mood>('feelgood');
  const [minutes, setMinutes] = useState<number>(90);
  const pickMutation = useDemoPick();
  const { hasUsedToday, markUsed } = useDemoPickGate();

  const result = pickMutation.data;

  const onSubmit = () => {
    pickMutation.mutate({ mood, minutes }, { onSuccess: () => markUsed() });
  };

  return (
    <div className={styles.page}>
      <PageContainer maxWidth="lg" padding="lg" centered>
        <Container fluid>
          <div className={styles.hero}>
            <Badge variant="primary" pill className={styles.eyebrow}>
              Free to try &middot; No account needed
            </Badge>
            <h1 className={styles.heroTitle}>What should we watch tonight?</h1>
            <Typography variant="body1" className={styles.heroSubtitle}>
              Tell us your mood and how much time you&apos;ve got. We&apos;ll
              find the one thing worth watching tonight.
            </Typography>
          </div>

          <Grid
            columns={2}
            mobileColumns={1}
            gap="xl"
            alignItems="center"
            className={styles.layout}
          >
            <div>
              <ul className={styles.valueProps}>
                <li className={styles.valueProp}>
                  <span className={styles.valuePropDot} />
                  <Typography variant="body1">
                    One pick in thirty seconds -- no more scrolling every app
                  </Typography>
                </li>
                <li className={styles.valueProp}>
                  <span className={styles.valuePropDot} />
                  <Typography variant="body1">
                    See exactly where to watch it -- Netflix, Prime, Disney+
                  </Typography>
                </li>
                <li className={styles.valueProp}>
                  <span className={styles.valuePropDot} />
                  <Typography variant="body1">
                    Made for two -- built around what you both like
                  </Typography>
                </li>
              </ul>
              <Typography variant="body2" className={styles.reassurance}>
                Free to try right now. Create a free account any time to get a
                pick every night.
              </Typography>
            </div>

            <div className={styles.demoColumn}>
              {!result && !hasUsedToday && (
                <Card variant="primary" elevation="high">
                  <CardContent>
                    <div className={styles.formSection}>
                      <Typography variant="body2" className={styles.label}>
                        Mood
                      </Typography>
                      <Flex wrap="wrap" gap="sm">
                        {MOODS.map(m => (
                          <button
                            key={m.id}
                            className={styles.chip({
                              selected: mood === m.id,
                            })}
                            onClick={() => setMood(m.id)}
                            type="button"
                          >
                            {m.label}
                          </button>
                        ))}
                      </Flex>
                    </div>

                    <div className={styles.formSection}>
                      <Typography variant="body2" className={styles.label}>
                        Time available: {minutes} minutes
                      </Typography>
                      <div className={styles.sliderRow}>
                        <Typography variant="caption">30</Typography>
                        <input
                          className={styles.slider}
                          type="range"
                          min={30}
                          max={180}
                          step={5}
                          value={minutes}
                          onChange={e =>
                            setMinutes(parseInt(e.target.value, 10))
                          }
                        />
                        <Typography variant="caption">180</Typography>
                      </div>
                    </div>

                    <Button
                      className={styles.pickButton}
                      variant="primary"
                      size="large"
                      onClick={onSubmit}
                      disabled={pickMutation.isPending}
                      isLoading={pickMutation.isPending}
                      isFullWidth
                    >
                      Show me a pick
                    </Button>
                    <Typography variant="caption" className={styles.microcopy}>
                      One free pick -- no account, no card.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {!result && hasUsedToday && (
                <Card variant="primary" elevation="high">
                  <CardContent className={styles.usedTodayCard}>
                    <Typography variant="body1">
                      You&apos;ve used today&apos;s free pick. Create a free
                      account to get a pick every night.
                    </Typography>
                    <SignupCta />
                  </CardContent>
                </Card>
              )}

              {pickMutation.error && (
                <Typography variant="body2" className={styles.errorMessage}>
                  {pickMutation.error.message}
                </Typography>
              )}

              {result && (
                <RecommendationResultCard
                  card={result.pick}
                  rationale={result.rationale}
                  actions={<SignupCta />}
                />
              )}
            </div>
          </Grid>

          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </Container>
      </PageContainer>
    </div>
  );
};

export default LandingPage;
