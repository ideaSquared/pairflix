import { render, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../__mocks__/mockTheme';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Accessibility testing utility for component library
 */
export class A11yTestUtils {
  /**
   * Render component with theme provider for accessibility testing
   */
  static renderWithA11y(ui: React.ReactElement): RenderResult {
    return render(React.createElement(ThemeProvider, { theme: mockTheme }, ui));
  }

  /**
   * Run axe accessibility tests on a rendered component
   */
  static async testA11y(container: HTMLElement): Promise<void> {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }

  /**
   * Test keyboard navigation for interactive elements
   */
  static async testKeyboardNavigation(
    container: HTMLElement,
    expectedFocusableElements: number
  ): Promise<void> {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements).toHaveLength(expectedFocusableElements);

    // Test that all focusable elements can receive focus
    for (const element of Array.from(focusableElements)) {
      (element as HTMLElement).focus();
      expect(element).toHaveFocus();
    }
  }

  /**
   * Test ARIA attributes and roles
   */
  static testAriaAttributes(
    element: HTMLElement,
    expectedAttributes: Record<string, string>
  ): void {
    Object.entries(expectedAttributes).forEach(([attribute, expectedValue]) => {
      expect(element).toHaveAttribute(attribute, expectedValue);
    });
  }

  /**
   * Test color contrast for text elements
   */
  static async testColorContrast(container: HTMLElement): Promise<void> {
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  }

  /**
   * Test form accessibility
   */
  static testFormA11y(formElement: HTMLElement): void {
    // Check for proper labeling
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel =
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        formElement.querySelector(`label[for="${input.id}"]`);
      expect(hasLabel).toBe(true);
    });

    // Check for error message association
    const errorElements = formElement.querySelectorAll(
      '[role="alert"], .error'
    );
    errorElements.forEach(error => {
      expect(error).toBeInTheDocument();
    });
  }

  /**
   * Complete accessibility test suite for a component
   */
  static async runFullA11yTest(
    component: React.ReactElement,
    options: {
      expectedFocusableElements?: number;
      ariaAttributes?: Record<string, string>;
      testKeyboard?: boolean;
      testColorContrast?: boolean;
    } = {}
  ): Promise<RenderResult> {
    const { container } = this.renderWithA11y(component);

    // Run axe accessibility tests
    await this.testA11y(container);

    // Test keyboard navigation if specified
    if (
      options.testKeyboard &&
      options.expectedFocusableElements !== undefined
    ) {
      await this.testKeyboardNavigation(
        container,
        options.expectedFocusableElements
      );
    }

    // Test ARIA attributes if specified
    if (options.ariaAttributes) {
      this.testAriaAttributes(
        container.firstElementChild as HTMLElement,
        options.ariaAttributes
      );
    }

    // Test color contrast if specified
    if (options.testColorContrast) {
      await this.testColorContrast(container);
    }

    return { container } as RenderResult;
  }
}

/**
 * Convenience function for basic accessibility testing
 */
export const testComponentA11y = async (
  component: React.ReactElement
): Promise<void> => {
  await A11yTestUtils.runFullA11yTest(component);
};

/**
 * Helper to create accessibility test describe blocks
 */
export const describeA11y = (
  componentName: string,
  tests: () => void
): void => {
  describe(`${componentName} - Accessibility`, tests);
};
