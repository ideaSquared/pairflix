import { render, screen } from '../../../tests/setup';
import { expectNoAxeViolations } from '../../../tests/axe';
import PrivacyPage from '../PrivacyPage';
import TermsPage from '../TermsPage';

describe('legal pages', () => {
  it('the privacy policy has no accessibility violations (axe)', async () => {
    const { baseElement } = render(<PrivacyPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(baseElement);
  });

  it('the terms of service have no accessibility violations (axe)', async () => {
    const { baseElement } = render(<TermsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    await expectNoAxeViolations(baseElement);
  });
});
