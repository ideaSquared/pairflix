import type { Meta, StoryObj } from '@storybook/react';
import clsx from 'clsx';
import React, { type ReactNode, useState } from 'react';

import Switch from './Switch';
import * as storyStyles from './Switch.stories.css';

const Container = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.container}>{children}</div>
);

const Group = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.group}>{children}</div>
);

const GroupRow = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.groupRow}>{children}</div>
);

const SectionTitle = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <h3 className={clsx(storyStyles.sectionTitle, className)}>{children}</h3>;

const SectionDescription = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <p className={clsx(storyStyles.sectionDescription, className)}>{children}</p>
);

const ItemContainer = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.itemContainer}>{children}</div>
);

const ItemLabel = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.itemLabel}>{children}</div>
);

const Card = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.card}>{children}</div>
);

const SettingsGroup = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.settingsGroup}>{children}</div>
);

const SettingItem = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.settingItem}>{children}</div>
);

const SettingLabel = ({ children }: { children: ReactNode }) => (
  <div className={storyStyles.settingLabel}>{children}</div>
);

const StatusDisplay = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={clsx(storyStyles.statusDisplay, className)}>{children}</div>
);

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A toggle switch component for boolean selection with customizable appearance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked (controlled component)',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state (uncontrolled component)',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
      defaultValue: false,
    },
    label: {
      control: 'text',
      description: 'Label for the switch',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the switch',
      defaultValue: 'medium',
    },
    color: {
      control: 'color',
      description: 'Color of the switch when checked',
    },
    onChange: {
      action: 'changed',
      description: 'Called when the switch state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// Basic example with default settings
export const Default: Story = {
  args: {
    label: 'Toggle me',
  },
};

// Switch sizes
export const Sizes: Story = {
  render: () => (
    <Container>
      <SectionTitle>Switch Sizes</SectionTitle>
      <SectionDescription>
        The Switch component is available in three sizes to match different
        interface needs.
      </SectionDescription>

      <GroupRow>
        <ItemContainer>
          <ItemLabel>Small</ItemLabel>
          <Switch size="small" label="Small switch" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Medium (default)</ItemLabel>
          <Switch size="medium" label="Medium switch" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Large</ItemLabel>
          <Switch size="large" label="Large switch" />
        </ItemContainer>
      </GroupRow>
    </Container>
  ),
};

// Custom colors
export const CustomColors: Story = {
  render: () => (
    <Container>
      <SectionTitle>Custom Colors</SectionTitle>
      <SectionDescription>
        The Switch component can be customized with different colors when in the
        checked state.
      </SectionDescription>

      <GroupRow>
        <ItemContainer>
          <ItemLabel>Default</ItemLabel>
          <Switch defaultChecked label="Default color" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Blue</ItemLabel>
          <Switch defaultChecked label="Blue" color="#2196F3" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Green</ItemLabel>
          <Switch defaultChecked label="Green" color="#4CAF50" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Purple</ItemLabel>
          <Switch defaultChecked label="Purple" color="#9C27B0" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Orange</ItemLabel>
          <Switch defaultChecked label="Orange" color="#FF9800" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Red</ItemLabel>
          <Switch defaultChecked label="Red" color="#F44336" />
        </ItemContainer>
      </GroupRow>
    </Container>
  ),
};

// States
export const States: Story = {
  render: () => (
    <Container>
      <SectionTitle>Switch States</SectionTitle>
      <SectionDescription>
        Various states of the Switch component including checked, unchecked, and
        disabled.
      </SectionDescription>

      <Group>
        <GroupRow>
          <ItemContainer>
            <ItemLabel>Unchecked</ItemLabel>
            <Switch label="Unchecked switch" />
          </ItemContainer>

          <ItemContainer>
            <ItemLabel>Checked</ItemLabel>
            <Switch defaultChecked label="Checked switch" />
          </ItemContainer>
        </GroupRow>

        <GroupRow>
          <ItemContainer>
            <ItemLabel>Disabled Unchecked</ItemLabel>
            <Switch disabled label="Disabled unchecked" />
          </ItemContainer>

          <ItemContainer>
            <ItemLabel>Disabled Checked</ItemLabel>
            <Switch disabled defaultChecked label="Disabled checked" />
          </ItemContainer>
        </GroupRow>
      </Group>
    </Container>
  ),
};

// Label positions - Note: This isn't built into the component but demonstrates how it could be styled
export const LabelVariations: Story = {
  render: () => (
    <Container>
      <SectionTitle>Label Variations</SectionTitle>
      <SectionDescription>
        The Switch component supports labels and can also be used without
        labels.
      </SectionDescription>

      <Group>
        <ItemContainer>
          <ItemLabel>With Label</ItemLabel>
          <Switch label="Feature enabled" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>
            Without Label (with aria-label for accessibility)
          </ItemLabel>
          <Switch aria-label="Toggle feature" />
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Long Label</ItemLabel>
          <Switch label="Enable this feature with a very long description that might wrap to multiple lines in some containers" />
        </ItemContainer>
      </Group>

      <SectionDescription className={storyStyles.sectionDescriptionSpaced}>
        Custom label positioning could be achieved through styling:
      </SectionDescription>

      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '14px' }}>
            Label above (with custom styling)
          </span>
          <div>
            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
              Enable notifications
            </div>
            <Switch aria-label="Enable notifications" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Switch aria-label="Enable feature" />
          <span style={{ fontSize: '16px' }}>
            Label on right (reversed order with custom styling)
          </span>
        </div>
      </div>
    </Container>
  ),
};

// Component wrapper for controlled demo
const ControlledDemo: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Container>
      <SectionTitle>Controlled Switch</SectionTitle>
      <SectionDescription>
        Example of a controlled Switch component where the state is managed by
        the parent component.
      </SectionDescription>

      <Group>
        <Switch
          checked={checked}
          onChange={isChecked => setChecked(isChecked)}
          label={`Feature is ${checked ? 'enabled' : 'disabled'}`}
        />

        <button
          onClick={() => setChecked(!checked)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Toggle from outside
        </button>

        <StatusDisplay>Current state: {checked ? 'ON' : 'OFF'}</StatusDisplay>
      </Group>
    </Container>
  );
};

// Interactive controlled component
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

// Component wrapper for form example
const FormExampleComponent: React.FC = () => {
  const [formState, setFormState] = useState({
    notifications: true,
    darkMode: false,
    newsletter: false,
    location: true,
  });

  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(JSON.stringify(formState, null, 2));
  };

  const handleChange = (key: keyof typeof formState) => (checked: boolean) => {
    setFormState({
      ...formState,
      [key]: checked,
    });
  };

  return (
    <Container>
      <SectionTitle>Form Integration Example</SectionTitle>
      <SectionDescription>
        Example of how Switch components can be integrated within a form.
      </SectionDescription>

      <Card>
        <form onSubmit={handleSubmit}>
          <SettingsGroup>
            <SectionTitle className={storyStyles.sectionTitleCompact}>
              App Settings
            </SectionTitle>

            <SettingItem>
              <SettingLabel>Enable notifications</SettingLabel>
              <Switch
                checked={formState.notifications}
                onChange={handleChange('notifications')}
                aria-label="Enable notifications"
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel>Dark mode</SettingLabel>
              <Switch
                checked={formState.darkMode}
                onChange={handleChange('darkMode')}
                aria-label="Enable dark mode"
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel>Subscribe to newsletter</SettingLabel>
              <Switch
                checked={formState.newsletter}
                onChange={handleChange('newsletter')}
                aria-label="Subscribe to newsletter"
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel>Share location</SettingLabel>
              <Switch
                checked={formState.location}
                onChange={handleChange('location')}
                aria-label="Share location"
              />
            </SettingItem>
          </SettingsGroup>

          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#0077cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Settings
          </button>
        </form>

        {submitted && (
          <StatusDisplay>
            <div>Form submitted with values:</div>
            <pre style={{ margin: '8px 0 0 0' }}>{submitted}</pre>
          </StatusDisplay>
        )}
      </Card>
    </Container>
  );
};

// Usage within forms
export const FormExample: Story = {
  render: () => <FormExampleComponent />,
};

// Real-world usage examples
export const UsageCases: Story = {
  render: () => (
    <Container>
      <SectionTitle>Common Usage Examples</SectionTitle>
      <SectionDescription>
        Examples of how the Switch component might be used in different contexts
        within PairFlix.
      </SectionDescription>

      <Card>
        <SectionTitle className={storyStyles.sectionTitleCompactSpaced}>
          User Preferences
        </SectionTitle>

        <SettingsGroup>
          <SettingItem>
            <div>
              <div style={{ fontSize: '16px' }}>Email Notifications</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Receive updates about new content and features
              </div>
            </div>
            <Switch defaultChecked aria-label="Enable email notifications" />
          </SettingItem>

          <SettingItem>
            <div>
              <div style={{ fontSize: '16px' }}>Dark Mode</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Use dark theme throughout the app
              </div>
            </div>
            <Switch aria-label="Enable dark mode" />
          </SettingItem>

          <SettingItem>
            <div>
              <div style={{ fontSize: '16px' }}>Auto-play Trailers</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Automatically play trailers when browsing movies
              </div>
            </div>
            <Switch defaultChecked aria-label="Enable auto-play for trailers" />
          </SettingItem>
        </SettingsGroup>
      </Card>

      <Card>
        <SectionTitle className={storyStyles.sectionTitleCompact}>
          Content Filters
        </SectionTitle>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '120px' }}>
            <Switch label="Movies" defaultChecked size="small" />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Switch label="TV Shows" defaultChecked size="small" />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Switch label="Documentaries" size="small" />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Switch label="Animation" size="small" />
          </div>
        </div>
      </Card>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}
            >
              Privacy Mode
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Hide your watch history and recommendations
            </div>
          </div>
          <Switch
            size="large"
            color="#9C27B0"
            aria-label="Enable privacy mode"
          />
        </div>
      </Card>
    </Container>
  ),
};

// Accessibility features
export const Accessibility: Story = {
  render: () => (
    <Container>
      <SectionTitle>Accessibility Features</SectionTitle>
      <SectionDescription>
        The Switch component is built with accessibility in mind, supporting
        keyboard navigation, screen readers, and proper ARIA attributes.
      </SectionDescription>

      <Group>
        <Card>
          <SectionTitle className={storyStyles.sectionTitleCompact}>
            Keyboard Support
          </SectionTitle>
          <SectionDescription>
            The Switch can be toggled with the keyboard. Try tabbing to the
            switch and pressing Enter or Space to toggle it.
          </SectionDescription>

          <Switch label="Keyboard accessible switch" />
        </Card>

        <Card>
          <SectionTitle className={storyStyles.sectionTitleCompact}>
            Screen Reader Support
          </SectionTitle>
          <SectionDescription>
            The Switch provides appropriate aria attributes for screen readers.
          </SectionDescription>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <Switch label="With visible label" defaultChecked />

            <Switch aria-label="Hidden label for screen readers only" />
          </div>

          <StatusDisplay>
            <div>Example ARIA attributes:</div>
            <div style={{ marginTop: '8px' }}>
              <code>aria-checked</code>: Indicates whether the switch is checked
              <br />
              <code>aria-label</code>: Provides a label when no visible label is
              present
            </div>
          </StatusDisplay>
        </Card>
      </Group>
    </Container>
  ),
};
