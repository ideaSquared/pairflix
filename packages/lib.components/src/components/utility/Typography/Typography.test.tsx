// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\utility\Typography\Typography.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react'; // Changed to * as React to ensure all React exports are available
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import Typography, {
  Caption,
  Code,
  ErrorText,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Overline,
  SmallText,
  SuccessText,
  Text,
} from './Typography';
import { typography } from './Typography.css';

// Helper function to render with the real theme class applied
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Typography', () => {
  it('renders text content correctly', () => {
    renderWithTheme(<Typography>Test Typography</Typography>);
    expect(screen.getByText('Test Typography')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <Typography variant="h1" data-testid="typography">
        H1 Typography
      </Typography>
    );

    let element = screen.getByTestId('typography');
    expect(element.tagName).toBe('H1'); // Changed to H1 since variant h1 renders as h1 tag

    // Test h2 variant
    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Typography variant="h2" data-testid="typography">
          H2 Typography
        </Typography>
      </div>
    );
    element = screen.getByTestId('typography');
    expect(element).toHaveTextContent('H2 Typography');
    expect(element.tagName).toBe('H2'); // Added this check
  });

  it('renders with specified HTML element using "as" prop', () => {
    renderWithTheme(
      <Typography as="article" data-testid="typography">
        Article Typography
      </Typography>
    );

    const element = screen.getByTestId('typography');
    expect(element.tagName).toBe('ARTICLE');
  });

  it('applies text alignment', () => {
    const { rerender } = renderWithTheme(
      <Typography align="left" data-testid="typography">
        Left Aligned
      </Typography>
    );

    let element = screen.getByTestId('typography');
    expect(element).toHaveStyle('text-align: left');

    // Test center alignment
    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Typography align="center" data-testid="typography">
          Center Aligned
        </Typography>
      </div>
    );
    element = screen.getByTestId('typography');
    expect(element).toHaveStyle('text-align: center');

    // Test right alignment
    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Typography align="right" data-testid="typography">
          Right Aligned
        </Typography>
      </div>
    );
    element = screen.getByTestId('typography');
    expect(element).toHaveStyle('text-align: right');
  });

  it('applies gutter bottom margin when specified', () => {
    renderWithTheme(
      <Typography gutterBottom data-testid="typography">
        With Margin
      </Typography>
    );

    // Margin resolves through a CSS custom property, which jsdom can't
    // substitute -- assert the recipe picked the right variant class
    // instead of the (unresolvable in jsdom) computed margin.
    const element = screen.getByTestId('typography');
    expect(element).toHaveClass(typography({ gutterBottom: true }));
  });

  it('applies custom text color', () => {
    renderWithTheme(
      <Typography color="blue" data-testid="typography">
        Blue Text
      </Typography>
    );

    const element = screen.getByTestId('typography');
    // Updated to handle RGB format
    expect(element).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('applies custom font weight', () => {
    renderWithTheme(
      <Typography weight="bold" data-testid="typography">
        Bold Text
      </Typography>
    );

    const element = screen.getByTestId('typography');
    expect(element).toHaveStyle('font-weight: 700');
  });

  it('truncates text with ellipsis when specified', () => {
    renderWithTheme(
      <Typography truncate lines={2} data-testid="typography">
        Long truncated text
      </Typography>
    );

    const element = screen.getByTestId('typography');
    expect(element).toHaveStyle('overflow: hidden');
    expect(element).toHaveStyle('text-overflow: ellipsis');
    expect(element).toHaveStyle('-webkit-line-clamp: 2');
  });

  it('preserves whitespace when noWrap is true', () => {
    renderWithTheme(
      <Typography noWrap data-testid="typography">
        No wrap text
      </Typography>
    );

    const element = screen.getByTestId('typography');
    expect(element).toHaveStyle('white-space: nowrap');
  });

  it('transforms text to uppercase when specified', () => {
    renderWithTheme(
      <Typography uppercase data-testid="typography">
        uppercase text
      </Typography>
    );

    const element = screen.getByTestId('typography');
    expect(element).toHaveStyle('text-transform: uppercase');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    renderWithTheme(
      <Typography ref={ref} data-testid="typography">
        Reference Test
      </Typography>
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('P');
  });
});

describe('Typography Variants', () => {
  it('renders H1 component with correct variant and element', () => {
    renderWithTheme(<H1 data-testid="h1">Heading 1</H1>);

    const element = screen.getByTestId('h1');
    expect(element.tagName).toBe('H1');
    expect(element).toHaveTextContent('Heading 1');
  });

  it('renders H2 component with correct variant and element', () => {
    renderWithTheme(<H2 data-testid="h2">Heading 2</H2>);

    const element = screen.getByTestId('h2');
    expect(element.tagName).toBe('H2');
  });

  it('renders H3 component with correct variant and element', () => {
    renderWithTheme(<H3 data-testid="h3">Heading 3</H3>);

    const element = screen.getByTestId('h3');
    expect(element.tagName).toBe('H3');
  });

  it('renders H4 component with correct variant and element', () => {
    renderWithTheme(<H4 data-testid="h4">Heading 4</H4>);

    const element = screen.getByTestId('h4');
    expect(element.tagName).toBe('H4');
  });

  it('renders H5 component with correct variant and element', () => {
    renderWithTheme(<H5 data-testid="h5">Heading 5</H5>);

    const element = screen.getByTestId('h5');
    expect(element.tagName).toBe('H5');
  });

  it('renders H6 component with correct variant and element', () => {
    renderWithTheme(<H6 data-testid="h6">Heading 6</H6>);

    const element = screen.getByTestId('h6');
    expect(element.tagName).toBe('H6');
  });

  it('renders Text component with body1 variant', () => {
    renderWithTheme(<Text data-testid="text">Body Text</Text>);

    const element = screen.getByTestId('text');
    expect(element.tagName).toBe('P');
  });

  it('renders SmallText component with body2 variant', () => {
    renderWithTheme(<SmallText data-testid="small-text">Small Text</SmallText>);

    const element = screen.getByTestId('small-text');
    expect(element.tagName).toBe('P');
  });

  it('renders ErrorText with error variant and correct color', () => {
    renderWithTheme(<ErrorText data-testid="error-text">Error Text</ErrorText>);

    const element = screen.getByTestId('error-text');
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveClass(typography({ variant: 'error' }));
  });

  it('renders SuccessText with success variant and correct color', () => {
    renderWithTheme(
      <SuccessText data-testid="success-text">Success Text</SuccessText>
    );

    const element = screen.getByTestId('success-text');
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveClass(typography({ variant: 'success' }));
  });

  it('renders Caption with caption variant', () => {
    renderWithTheme(<Caption data-testid="caption">Caption Text</Caption>);

    const element = screen.getByTestId('caption');
    expect(element.tagName).toBe('SPAN');
  });

  it('renders Code with code variant and monospace font', () => {
    renderWithTheme(<Code data-testid="code">Code Text</Code>);

    const element = screen.getByTestId('code');
    expect(element.tagName).toBe('CODE');
    // Check for code block styling
    expect(element).toHaveClass(typography({ variant: 'code' }));
  });

  it('renders Overline with overline variant and uppercase transform', () => {
    renderWithTheme(<Overline data-testid="overline">Overline Text</Overline>);

    const element = screen.getByTestId('overline');
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveStyle('text-transform: uppercase');
  });
});
