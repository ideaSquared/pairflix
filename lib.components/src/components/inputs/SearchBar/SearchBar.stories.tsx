import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import styled from 'styled-components';

import SearchBar from './SearchBar';

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ResultsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 500;
`;

const Divider = styled.hr`
  margin: 32px 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Description = styled.p`
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const meta: Meta<typeof SearchBar> = {
  title: 'Inputs/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A customizable search bar component with debounce functionality, clear button, and various styling options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Value of the search input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      defaultValue: 'Search...',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    onSearch: {
      action: 'search',
      description:
        'Callback when search is triggered (on enter or search button click)',
    },
    showButton: {
      control: 'boolean',
      description: 'Whether to show the search button',
      defaultValue: true,
    },
    buttonText: {
      control: 'text',
      description: 'Custom text for the search button',
      defaultValue: 'Search',
    },
    showClear: {
      control: 'boolean',
      description: "Whether to show a clear button when there's input",
      defaultValue: true,
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the search bar',
      defaultValue: 'medium',
    },
    isFullWidth: {
      control: 'boolean',
      description: 'Whether the search bar takes up the full width',
      defaultValue: false,
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether to auto-focus the input',
      defaultValue: false,
    },
    debounceTime: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Debounce time in milliseconds for onChange',
      defaultValue: 300,
    },
    isInvalid: {
      control: 'boolean',
      description: 'Whether the search bar is in an error state',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the search bar is disabled',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// Basic example with default settings
export const Default: Story = {
  args: {
    placeholder: 'Search movies...',
  },
};

// Component wrapper for interactive story
const InteractiveDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState('');

  const handleChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearch = (value: string) => {
    setSearchResult(value);
  };

  return (
    <Container>
      <Description>
        Type to see the debounced value update. Press Enter or click the Search
        button to trigger a search.
      </Description>

      <SearchBar
        value={searchTerm}
        placeholder="Search movies or TV shows..."
        onChange={handleChange}
        onSearch={handleSearch}
      />

      <ResultsContainer>
        <div>
          <strong>Current value (debounced):</strong> {searchTerm || '(empty)'}
        </div>
        <div>
          <strong>Search triggered with:</strong>{' '}
          {searchResult || '(no search yet)'}
        </div>
      </ResultsContainer>
    </Container>
  );
};

// Interactive example with results display
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <Container>
      <SectionTitle>SearchBar Sizes</SectionTitle>
      <Description>
        The SearchBar component comes in three sizes to fit different UI needs.
      </Description>

      <Section>
        <Grid>
          <div>
            <div style={{ marginBottom: '8px' }}>Small</div>
            <SearchBar size="small" placeholder="Small search..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>Medium (default)</div>
            <SearchBar size="medium" placeholder="Medium search..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>Large</div>
            <SearchBar size="large" placeholder="Large search..." />
          </div>
        </Grid>
      </Section>
    </Container>
  ),
};

// Button variations
export const ButtonVariations: Story = {
  render: () => (
    <Container>
      <SectionTitle>Button Variations</SectionTitle>
      <Description>
        The search button can be customized or hidden entirely.
      </Description>

      <Section>
        <Grid>
          <div>
            <div style={{ marginBottom: '8px' }}>Default button</div>
            <SearchBar placeholder="Default button..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>Custom button text</div>
            <SearchBar placeholder="Custom button..." buttonText="Find" />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>No button</div>
            <SearchBar placeholder="No button..." showButton={false} />
          </div>
        </Grid>
      </Section>
    </Container>
  ),
};

// Full width examples
export const FullWidth: Story = {
  render: () => (
    <Container>
      <SectionTitle>Full Width SearchBar</SectionTitle>
      <Description>
        The SearchBar can take up the full width of its container.
      </Description>

      <SearchBar isFullWidth placeholder="Full width search..." />

      <div style={{ maxWidth: '400px' }}>
        <Description>
          The same full-width SearchBar in a narrower container:
        </Description>
        <SearchBar
          isFullWidth
          placeholder="Full width in narrow container..."
        />
      </div>
    </Container>
  ),
};

// States
export const States: Story = {
  render: () => (
    <Container>
      <SectionTitle>SearchBar States</SectionTitle>
      <Description>
        The SearchBar component supports various states.
      </Description>

      <Section>
        <Grid>
          <div>
            <div style={{ marginBottom: '8px' }}>Default</div>
            <SearchBar placeholder="Default state..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>With value</div>
            <SearchBar value="PairFlix movies" placeholder="With value..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>Error state</div>
            <SearchBar isInvalid placeholder="Error state..." />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>Disabled</div>
            <SearchBar disabled placeholder="Disabled..." />
          </div>
        </Grid>
      </Section>
    </Container>
  ),
};

// Component wrapper for debounce demo
const DebounceDemoComponent: React.FC = () => {
  const [immediateValue, setImmediateValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [debouncedValueSlow, setDebouncedValueSlow] = useState('');

  return (
    <Container>
      <SectionTitle>Debounce Functionality</SectionTitle>
      <Description>
        The SearchBar includes built-in debounce functionality to limit how
        often the onChange event fires. Type quickly in the examples below to
        see the difference.
      </Description>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>No debounce (immediate)</div>
        <input
          type="text"
          value={immediateValue}
          onChange={e => setImmediateValue(e.target.value)}
          placeholder="Type here (immediate updates)..."
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>Default debounce (300ms)</div>
        <SearchBar
          placeholder="Type here (300ms debounce)..."
          onChange={setDebouncedValue}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>Slow debounce (1000ms)</div>
        <SearchBar
          placeholder="Type here (1000ms debounce)..."
          debounceTime={1000}
          onChange={setDebouncedValueSlow}
        />
      </div>

      <ResultsContainer>
        <div>
          <strong>Immediate value:</strong> {immediateValue}
        </div>
        <div>
          <strong>Debounced value (300ms):</strong> {debouncedValue}
        </div>
        <div>
          <strong>Debounced value (1000ms):</strong> {debouncedValueSlow}
        </div>
      </ResultsContainer>
    </Container>
  );
};

// Debounce demonstration
export const DebounceDemo: Story = {
  render: () => <DebounceDemoComponent />,
};

// Component wrapper for clear functionality demo
const ClearFunctionalityComponent: React.FC = () => {
  const [value1, setValue1] = useState('This can be cleared');
  const [value2, setValue2] = useState('This cannot be cleared');

  return (
    <Container>
      <SectionTitle>Clear Button Functionality</SectionTitle>
      <Description>
        The SearchBar can show a clear button when text is entered. This can be
        enabled or disabled.
      </Description>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>With clear button (default)</div>
        <SearchBar
          value={value1}
          onChange={setValue1}
          placeholder="Type something..."
        />
      </div>

      <div>
        <div style={{ marginBottom: '8px' }}>Without clear button</div>
        <SearchBar
          value={value2}
          onChange={setValue2}
          showClear={false}
          placeholder="Type something..."
        />
      </div>
    </Container>
  );
};

// Clear button functionality
export const ClearFunctionality: Story = {
  render: () => <ClearFunctionalityComponent />,
};

// Real-world examples
export const UseCase: Story = {
  render: () => (
    <Container>
      <SectionTitle>Real-world Examples</SectionTitle>
      <Description>
        Examples of how the SearchBar component might be used in different
        contexts.
      </Description>

      <Section>
        <div style={{ marginBottom: '8px' }}>Main header search</div>
        <SearchBar
          size="medium"
          placeholder="Search movies, TV shows, actors..."
          buttonText="Find"
        />
      </Section>

      <Divider />

      <Section>
        <div style={{ marginBottom: '8px' }}>Watchlist filter search</div>
        <SearchBar
          size="small"
          placeholder="Filter your watchlist..."
          showButton={false}
          isFullWidth
        />
      </Section>

      <Divider />

      <Section>
        <div style={{ marginBottom: '8px' }}>Advanced search form</div>
        <div
          style={{
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}
            >
              Search titles
            </label>
            <SearchBar
              isFullWidth
              placeholder="Enter keywords..."
              buttonText="Search"
            />
          </div>

          <div style={{ fontSize: '12px', color: '#666' }}>
            Press Enter or click Search to begin your search
          </div>
        </div>
      </Section>
    </Container>
  ),
};
