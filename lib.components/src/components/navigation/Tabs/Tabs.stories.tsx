import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '../../../styles/theme';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

/**
 * A compound component for creating accessible tabbed interfaces.
 *
 * The Tabs component follows the WAI-ARIA design pattern for tabs, providing a
 * fully accessible tabbed interface with keyboard navigation and proper ARIA attributes.
 * It supports both horizontal and vertical layouts, as well as controlled and uncontrolled usage.
 */
const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    componentSubtitle:
      'Accessible tabbed interface with horizontal and vertical layouts',
    docs: {
      description: {
        component: `
Tabs provide an easy way to navigate between different views within the same context.
This implementation follows the compound component pattern with four main components:

- \`Tabs\`: The main container component that manages tab state
- \`TabList\`: Container for the tab buttons/triggers
- \`Tab\`: Individual tab button/trigger
- \`TabPanel\`: Content panel associated with each tab

The component supports both controlled and uncontrolled usage patterns and is fully accessible with
keyboard navigation and proper ARIA attributes.
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ padding: '1rem', maxWidth: '800px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default selected tab (uncontrolled)',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      control: 'text',
      description: 'Selected tab (controlled)',
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Called when selected tab changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    vertical: {
      control: 'boolean',
      description: 'Render tabs vertically',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      description: 'Children must be TabList and TabPanel components',
      control: { type: 'object' },
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/**
 * Basic tabs with default horizontal layout. This example shows the simplest usage
 * of the Tabs component with uncontrolled behavior (using defaultValue).
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">First Tab</Tab>
        <Tab value="tab2">Second Tab</Tab>
        <Tab value="tab3">Third Tab</Tab>
      </TabList>

      <TabPanel value="tab1">
        <h3>First Tab Content</h3>
        <p>This is the content for the first tab.</p>
      </TabPanel>

      <TabPanel value="tab2">
        <h3>Second Tab Content</h3>
        <p>This is the content for the second tab.</p>
      </TabPanel>

      <TabPanel value="tab3">
        <h3>Third Tab Content</h3>
        <p>This is the content for the third tab.</p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Tabs with controlled state, where the active tab is managed externally.
 * This is useful when you need to control tab selection from outside the component
 * or synchronize it with other parts of your application.
 */
export const ControlledTabs: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p>
            <strong>Current active tab:</strong> {activeTab}
          </p>
          <div>
            <button
              onClick={() => setActiveTab('tab1')}
              disabled={activeTab === 'tab1'}
            >
              Activate Tab 1
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              disabled={activeTab === 'tab2'}
              style={{ marginLeft: '8px' }}
            >
              Activate Tab 2
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              disabled={activeTab === 'tab3'}
              style={{ marginLeft: '8px' }}
            >
              Activate Tab 3
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab value="tab1">First Tab</Tab>
            <Tab value="tab2">Second Tab</Tab>
            <Tab value="tab3">Third Tab</Tab>
          </TabList>

          <TabPanel value="tab1">
            <h3>First Tab Content</h3>
            <p>This tab is externally controlled.</p>
          </TabPanel>

          <TabPanel value="tab2">
            <h3>Second Tab Content</h3>
            <p>You can control which tab is active using the buttons above.</p>
          </TabPanel>

          <TabPanel value="tab3">
            <h3>Third Tab Content</h3>
            <p>This demonstrates controlled component behavior.</p>
          </TabPanel>
        </Tabs>
      </div>
    );
  },
};

/**
 * Vertical tabs layout with the tabs on the left side.
 * This layout is useful when you have more tabs than would fit horizontally
 * or when the content benefits from a side-by-side layout.
 */
export const VerticalTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" vertical>
      <TabList>
        <Tab value="tab1">Dashboard</Tab>
        <Tab value="tab2">User Profile</Tab>
        <Tab value="tab3">Settings</Tab>
        <Tab value="tab4">Notifications</Tab>
      </TabList>

      <TabPanel value="tab1">
        <h3>Dashboard</h3>
        <p>This is a vertical tab layout with the tabs on the left side.</p>
        <p>Vertical tabs are useful for:</p>
        <ul>
          <li>Displaying many tabs that wouldn't fit horizontally</li>
          <li>Creating a sidebar navigation pattern</li>
          <li>When tab labels are long</li>
          <li>When panel content benefits from extra vertical space</li>
        </ul>
      </TabPanel>

      <TabPanel value="tab2">
        <h3>User Profile</h3>
        <p>User profile settings and information would go here.</p>
      </TabPanel>

      <TabPanel value="tab3">
        <h3>Settings</h3>
        <p>Application settings would go here.</p>
      </TabPanel>

      <TabPanel value="tab4">
        <h3>Notifications</h3>
        <p>Notification preferences and history would go here.</p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Tabs with some disabled options.
 * This demonstrates how to mark certain tabs as disabled and not selectable.
 */
export const DisabledTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">Enabled Tab</Tab>
        <Tab value="tab2" disabled>
          Disabled Tab
        </Tab>
        <Tab value="tab3">Enabled Tab</Tab>
        <Tab value="tab4" disabled>
          Disabled Tab
        </Tab>
      </TabList>

      <TabPanel value="tab1">
        <h3>First Tab Content</h3>
        <p>This tab is enabled and selectable.</p>
      </TabPanel>

      <TabPanel value="tab2">
        <h3>Second Tab Content</h3>
        <p>This content won't be visible because the tab is disabled.</p>
      </TabPanel>

      <TabPanel value="tab3">
        <h3>Third Tab Content</h3>
        <p>This tab is also enabled and selectable.</p>
      </TabPanel>

      <TabPanel value="tab4">
        <h3>Fourth Tab Content</h3>
        <p>This content won't be visible because the tab is disabled.</p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Tabs with custom styling applied to individual tabs and tab panels.
 * This demonstrates how to customize the appearance using className and inline styles.
 */
export const CustomStyledTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList className="custom-tab-list">
        <Tab
          value="tab1"
          style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '4px 4px 0 0',
            fontWeight: 'bold',
          }}
        >
          Custom Tab 1
        </Tab>
        <Tab
          value="tab2"
          style={{
            backgroundColor: '#fff8e1',
            borderRadius: '4px 4px 0 0',
            fontWeight: 'bold',
          }}
        >
          Custom Tab 2
        </Tab>
        <Tab
          value="tab3"
          style={{
            backgroundColor: '#f9fbe7',
            borderRadius: '4px 4px 0 0',
            fontWeight: 'bold',
          }}
        >
          Custom Tab 3
        </Tab>
      </TabList>

      <TabPanel
        value="tab1"
        style={{
          backgroundColor: '#e3f2fd',
          borderRadius: '0 4px 4px 4px',
          padding: '16px',
          borderTop: 'none',
        }}
      >
        <h3>Blue Themed Tab</h3>
        <p>This panel has custom styling with a blue theme.</p>
      </TabPanel>

      <TabPanel
        value="tab2"
        style={{
          backgroundColor: '#fff8e1',
          borderRadius: '0 4px 4px 4px',
          padding: '16px',
          borderTop: 'none',
        }}
      >
        <h3>Yellow Themed Tab</h3>
        <p>This panel has custom styling with a yellow theme.</p>
      </TabPanel>

      <TabPanel
        value="tab3"
        style={{
          backgroundColor: '#f9fbe7',
          borderRadius: '0 4px 4px 4px',
          padding: '16px',
          borderTop: 'none',
        }}
      >
        <h3>Green Themed Tab</h3>
        <p>This panel has custom styling with a green theme.</p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Tabs with complex content including forms, images, and interactive elements.
 * This demonstrates how versatile the tab panels can be with different types of content.
 */
export const ComplexContent: Story = {
  render: () => (
    <Tabs defaultValue="profile">
      <TabList>
        <Tab value="profile">User Profile</Tab>
        <Tab value="settings">Settings</Tab>
        <Tab value="notifications">Notifications</Tab>
      </TabList>

      <TabPanel value="profile">
        <h3>User Profile</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
          >
            <span style={{ fontSize: '40px' }}>👤</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}
              >
                Display Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '100%',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}
              >
                Bio
              </label>
              <textarea
                rows={4}
                defaultValue="Film enthusiast and avid watcher of sci-fi and documentaries."
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="settings">
        <h3>Account Settings</h3>
        <div style={{ marginBottom: '16px' }}>
          <h4>Privacy</h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <input type="checkbox" id="public-profile" defaultChecked />
            <label htmlFor="public-profile" style={{ marginLeft: '8px' }}>
              Make my profile public
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="show-activity" />
            <label htmlFor="show-activity" style={{ marginLeft: '8px' }}>
              Show my activity to friends
            </label>
          </div>
        </div>
        <div>
          <h4>Notification Preferences</h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <input type="checkbox" id="email-notif" defaultChecked />
            <label htmlFor="email-notif" style={{ marginLeft: '8px' }}>
              Email notifications
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="push-notif" defaultChecked />
            <label htmlFor="push-notif" style={{ marginLeft: '8px' }}>
              Push notifications
            </label>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="notifications">
        <h3>Notifications</h3>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxHeight: '250px',
            overflow: 'auto',
          }}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <li
              key={i}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                }}
              >
                {i % 2 === 0 ? '👍' : '💬'}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {i % 2 === 0 ? 'New like' : 'New comment'}
                </div>
                <div style={{ color: '#666', fontSize: '0.9em' }}>
                  {i % 2 === 0
                    ? 'User liked your watchlist item'
                    : 'User commented on your review'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Tabs with dark theme styling.
 * This demonstrates how the component adapts to the dark theme.
 */
export const DarkTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={darkTheme}>
        <div
          style={{
            padding: '1rem',
            background: '#121212',
            maxWidth: '800px',
            width: '100%',
            borderRadius: '8px',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">First Tab</Tab>
        <Tab value="tab2">Second Tab</Tab>
        <Tab value="tab3">Third Tab</Tab>
      </TabList>

      <TabPanel value="tab1">
        <h3>Dark Theme Tab 1</h3>
        <p>This demonstrates the tabs with dark theme styling.</p>
      </TabPanel>

      <TabPanel value="tab2">
        <h3>Dark Theme Tab 2</h3>
        <p>All colors and styles are adapted for dark mode.</p>
      </TabPanel>

      <TabPanel value="tab3">
        <h3>Dark Theme Tab 3</h3>
        <p>The component uses the theme context to adjust its appearance.</p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * An interactive example that demonstrates dynamic tab creation and management.
 * This shows how to work with a variable number of tabs.
 */
export const DynamicTabs: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tabs, setTabs] = useState([
      { id: 'tab1', label: 'First Tab', content: 'Content for first tab' },
      { id: 'tab2', label: 'Second Tab', content: 'Content for second tab' },
    ]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeTab, setActiveTab] = useState('tab1');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [counter, setCounter] = useState(3);

    const addTab = () => {
      const newId = `tab${counter}`;
      setTabs([
        ...tabs,
        {
          id: newId,
          label: `Tab ${counter}`,
          content: `Content for tab ${counter}`,
        },
      ]);
      setCounter(counter + 1);
      setActiveTab(newId);
    };

    const removeTab = (id: string) => {
      const newTabs = tabs.filter(tab => tab.id !== id);
      setTabs(newTabs);

      // If we're removing the active tab, switch to the first available tab
      if (activeTab === id && newTabs.length > 0) {
        // Using optional chaining and nullish coalescing to handle possible undefined
        setActiveTab(newTabs[0]?.id || 'tab1');
      }
    };

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={addTab}>Add New Tab</button>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList>
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                value={tab.id}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {tab.label}
                {tabs.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    style={{
                      marginLeft: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: '#666',
                    }}
                    aria-label={`Close ${tab.label}`}
                  >
                    ×
                  </button>
                )}
              </Tab>
            ))}
          </TabList>

          {tabs.map(tab => (
            <TabPanel key={tab.id} value={tab.id}>
              <h3>{tab.label}</h3>
              <p>{tab.content}</p>
            </TabPanel>
          ))}
        </Tabs>
      </div>
    );
  },
};

/**
 * An example highlighting the accessibility features of the Tabs component.
 * This demonstrates keyboard navigation and ARIA attributes.
 */
export const AccessibilityFeatures: Story = {
  render: () => (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Accessibility Features Demonstration</h3>
        <p>
          This Tabs implementation includes the following accessibility
          features:
        </p>
        <ul>
          <li>
            Proper ARIA roles and attributes (role="tablist", role="tab",
            role="tabpanel")
          </li>
          <li>Keyboard navigation:</li>
          <ul>
            <li>⬅️ / ➡️: Navigate between tabs (horizontal layout)</li>
            <li>⬆️ / ⬇️: Navigate between tabs (vertical layout)</li>
            <li>Home: Jump to first tab</li>
            <li>End: Jump to last tab</li>
            <li>Enter/Space: Activate the focused tab</li>
          </ul>
          <li>Focus management when changing tabs</li>
          <li>Hidden panels for inactive tabs</li>
          <li>Tab focus indicators</li>
        </ul>
        <p>
          <strong>
            Try using the keyboard to navigate through the tabs below.
          </strong>
        </p>
      </div>

      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
          <Tab value="tab3">Tab 3</Tab>
          <Tab value="tab4" disabled>
            Disabled Tab
          </Tab>
          <Tab value="tab5">Tab 5</Tab>
        </TabList>

        <TabPanel value="tab1">
          <h3>Tab Panel 1</h3>
          <p>Try using keyboard navigation:</p>
          <ul>
            <li>Press Tab to move focus to the tablist</li>
            <li>Use arrow keys to navigate between tabs</li>
            <li>Press Home to jump to the first tab</li>
            <li>Press End to jump to the last tab</li>
          </ul>
        </TabPanel>

        <TabPanel value="tab2">
          <h3>Tab Panel 2</h3>
          <p>
            Notice how the focus indicator clearly shows which tab has keyboard
            focus.
          </p>
        </TabPanel>

        <TabPanel value="tab3">
          <h3>Tab Panel 3</h3>
          <p>The disabled tab will be skipped during keyboard navigation.</p>
        </TabPanel>

        <TabPanel value="tab4">
          <h3>Tab Panel 4 (Disabled)</h3>
          <p>This content won't be visible because the tab is disabled.</p>
        </TabPanel>

        <TabPanel value="tab5">
          <h3>Tab Panel 5</h3>
          <p>
            Arrow keys will cycle around from the last tab to the first and vice
            versa.
          </p>
        </TabPanel>
      </Tabs>
    </div>
  ),
};
