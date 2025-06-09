import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '../../../styles/theme';
import { Modal, ModalProps, ModalSize } from './Modal';

// Styled components for better visual organization
const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const GroupRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
`;

const SectionDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Card = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.card};
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.light};
    outline-offset: 2px;
  }
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
`;

const meta: Meta<typeof Modal> = {
  title: 'Overlay/Modal',
  component: Modal,
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
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A customizable Modal component that provides a focused overlay for important content or actions. Modals are used when the application requires user attention or interaction before proceeding.',
      },
    },
  },
  args: {
    isOpen: true,
    title: 'Example Modal',
    size: 'medium',
    closeOnBackdropClick: true,
    closeOnEsc: true,
    showCloseButton: true,
    blockScrollOnMount: true,
  },
  argTypes: {
    onClose: {
      action: 'closed',
      description: 'Called when modal is requested to close',
    },
    initialFocusRef: {
      control: false,
      description: 'The element to receive focus when the modal opens',
    },
    finalFocusRef: {
      control: false,
      description: 'The element to receive focus when the modal closes',
    },
    headerRender: {
      control: false,
      description: 'Custom function to render the modal header',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class name',
    },
    children: {
      control: false,
      description: 'Content to be rendered inside the modal',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'fullscreen'],
      description: 'Size of the modal',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is displayed',
    },
    title: {
      control: 'text',
      description: 'Text to display in the modal header',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Whether clicking the backdrop closes the modal',
    },
    closeOnEsc: {
      control: 'boolean',
      description: 'Whether pressing the Escape key closes the modal',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether to show the close button in the header',
    },
    blockScrollOnMount: {
      control: 'boolean',
      description: 'Whether to block scrolling when the modal is open',
    },
  },
};

export default meta;
export type Story = StoryObj<typeof Modal>;

// Template to control isOpen state
const ModalTemplate = (args: ModalProps) => {
  const [open, setOpen] = useState(false);
  const finalFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <Container>
      <ActionButton ref={finalFocusRef} onClick={() => setOpen(true)}>
        Open Modal
      </ActionButton>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => {
          args.onClose?.();
          setOpen(false);
        }}
        finalFocusRef={finalFocusRef}
      >
        <p>This is the modal content. Place any ReactNode here.</p>
      </Modal>
    </Container>
  );
};

export const Default: Story = {
  render: args => <ModalTemplate {...args} />,
};

// Helper component for controlled example
const ControlledExampleDemo = () => {
  const [open, setOpen] = useState(false);
  const finalFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <Container>
      <SectionTitle>Controlled Modal Example</SectionTitle>
      <SectionDescription>
        A controlled example of the Modal component where the open state is
        managed externally. This pattern is useful when you need to perform
        additional actions when opening or closing the modal.
      </SectionDescription>

      <Card>
        <ActionButton ref={finalFocusRef} onClick={() => setOpen(true)}>
          Open Controlled Modal
        </ActionButton>

        <Modal
          isOpen={open}
          title="Controlled Modal"
          onClose={() => setOpen(false)}
          finalFocusRef={finalFocusRef}
          size="medium"
        >
          <div style={{ padding: '16px' }}>
            <p>
              This modal's open state is controlled by the parent component.
            </p>
            <div style={{ marginTop: '24px' }}>
              <ActionButton onClick={() => setOpen(false)}>
                Close from inside
              </ActionButton>
            </div>
          </div>
        </Modal>
      </Card>

      <CodeBlock>{`
const [open, setOpen] = useState(false);
const finalFocusRef = useRef<HTMLButtonElement>(null);

<button ref={finalFocusRef} onClick={() => setOpen(true)}>
  Open Modal
</button>

<Modal
  isOpen={open}
  title="Controlled Modal"
  onClose={() => setOpen(false)}
  finalFocusRef={finalFocusRef}
>
  <p>Modal content here</p>
  <button onClick={() => setOpen(false)}>Close</button>
</Modal>
			`}</CodeBlock>
    </Container>
  );
};

// Alternative controlled example with more explanation
export const ControlledExample: Story = {
  render: () => <ControlledExampleDemo />,
};

export const Sizes: Story = {
  render: () => (
    <Container>
      <SectionTitle>Modal Sizes</SectionTitle>
      <SectionDescription>
        The Modal component comes in four different sizes to accommodate various
        content needs: small, medium, large, and fullscreen.
      </SectionDescription>

      <GroupRow>
        {(['small', 'medium', 'large', 'fullscreen'] as ModalSize[]).map(
          size => (
            <ItemContainer key={size}>
              <ItemLabel>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </ItemLabel>
              <div>
                {(() => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <>
                      <ActionButton onClick={() => setIsOpen(true)}>
                        Open {size} modal
                      </ActionButton>
                      <Modal
                        isOpen={isOpen}
                        title={`${
                          size.charAt(0).toUpperCase() + size.slice(1)
                        } Modal`}
                        size={size}
                        onClose={() => setIsOpen(false)}
                      >
                        <div style={{ padding: '16px' }}>
                          <p>This is a {size} modal.</p>
                          <p>Use this size for {sizeDescriptions[size]}</p>
                        </div>
                      </Modal>
                    </>
                  );
                })()}
              </div>
            </ItemContainer>
          )
        )}
      </GroupRow>

      <CodeBlock>{`
// Size options
<Modal size="small" ... />
<Modal size="medium" ... /> {/* Default */}
<Modal size="large" ... />
<Modal size="fullscreen" ... />
			`}</CodeBlock>
    </Container>
  ),
};

// Descriptions for different modal sizes
const sizeDescriptions = {
  small: 'simple confirmations or short forms',
  medium: 'most common use cases and forms',
  large: 'complex forms or detailed content displays',
  fullscreen: 'immersive experiences or complex workflows',
};

// Component wrapper for custom header demo
const CustomHeaderDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <SectionTitle>Custom Header Rendering</SectionTitle>
      <SectionDescription>
        The Modal component allows custom header rendering for complete control
        over the header appearance and functionality.
      </SectionDescription>

      <Card>
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal with Custom Header
        </ActionButton>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Custom Header Example"
          headerRender={({ title, onClose }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f0f7ff',
                borderBottom: '1px solid #cce0ff',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '20px' }}>🔔</span>
                <strong>{title}</strong>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid #0077cc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#0077cc',
                  cursor: 'pointer',
                }}
              >
                Close Custom
              </button>
            </div>
          )}
        >
          <div style={{ padding: '16px' }}>
            <p>
              This modal has a custom header with a different design and close
              button.
            </p>
            <p>
              Custom headers are useful when you need to add additional controls
              or styling to the modal header.
            </p>
          </div>
        </Modal>
      </Card>

      <SectionTitle style={{ fontSize: '16px', marginTop: '16px' }}>
        Implementation
      </SectionTitle>
      <CodeBlock>{`
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Custom Header Example"
  headerRender={({ title, onClose }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', ... }}>
      <div>
        <span>🔔</span>
        <strong>{title}</strong>
      </div>
      <button onClick={onClose}>Close Custom</button>
    </div>
  )}
>
  <p>Modal content here</p>
</Modal>
			`}</CodeBlock>
    </Container>
  );
};

export const CustomHeader: Story = {
  render: () => <CustomHeaderDemo />,
};

// Component wrapper for close behavior demo
const CloseBehaviorDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <SectionTitle>Modal Close Behaviors</SectionTitle>
      <SectionDescription>
        The Modal component offers different close behaviors to control how
        users can dismiss the modal. This is especially useful for important
        confirmations or forms where accidental dismissal should be prevented.
      </SectionDescription>

      <Card>
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal with Restricted Close
        </ActionButton>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Restricted Close Behavior"
          closeOnBackdropClick={false}
          closeOnEsc={false}
        >
          <div style={{ padding: '16px' }}>
            <p>
              This modal can only be closed using the close button in the header
              or the button below. Clicking outside the modal or pressing ESC
              will not close it.
            </p>
            <p>This behavior is useful for:</p>
            <ul>
              <li>Critical confirmation dialogs</li>
              <li>Forms with unsaved changes</li>
              <li>Important notifications that require acknowledgement</li>
            </ul>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <ActionButton onClick={() => setIsOpen(false)}>
                I understand, close modal
              </ActionButton>
            </div>
          </div>
        </Modal>
      </Card>

      <GroupRow>
        <div>
          <SectionTitle style={{ fontSize: '16px' }}>
            Available Close Options
          </SectionTitle>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              Close button in header (<code>showCloseButton</code>)
            </li>
            <li>
              Clicking backdrop (<code>closeOnBackdropClick</code>)
            </li>
            <li>
              Pressing ESC key (<code>closeOnEsc</code>)
            </li>
            <li>Custom close buttons within content</li>
          </ul>
        </div>
      </GroupRow>

      <CodeBlock>{`
// Prevent closing by clicking outside or pressing ESC
<Modal
  closeOnBackdropClick={false}
  closeOnEsc={false}
  ...
/>

// Hide the close button in the header
<Modal
  showCloseButton={false}
  ...
/>
			`}</CodeBlock>
    </Container>
  );
};

export const CloseBehavior: Story = {
  render: () => <CloseBehaviorDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Modal with restricted close behavior - useful for important confirmations.',
      },
    },
  },
};

// Component wrapper for focus management demo
const FocusManagementDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const finalFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <Container>
      <SectionTitle>Focus Management</SectionTitle>
      <SectionDescription>
        The Modal component supports advanced focus management for better
        accessibility and user experience. You can control where focus goes when
        the modal opens and closes.
      </SectionDescription>

      <Card>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton onClick={() => setIsOpen(true)}>
            Open Modal
          </ActionButton>
          <ActionButton
            ref={finalFocusRef}
            onClick={() =>
              alert('This button will receive focus when modal closes')
            }
          >
            Focus returns here
          </ActionButton>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Focus Management Example"
          initialFocusRef={initialFocusRef}
          finalFocusRef={finalFocusRef}
        >
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="name"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Name (auto-focused)
              </label>
              <input
                ref={initialFocusRef}
                id="name"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                placeholder="Enter your name"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="email"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Email
              </label>
              <input
                id="email"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <ActionButton onClick={() => setIsOpen(false)}>
                Close Modal
              </ActionButton>
            </div>
          </div>
        </Modal>
      </Card>

      <SectionTitle style={{ fontSize: '16px', marginTop: '16px' }}>
        How Focus Management Works
      </SectionTitle>
      <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
        <li>
          <strong>initialFocusRef</strong>: Element to receive focus when modal
          opens (input field above)
        </li>
        <li>
          <strong>finalFocusRef</strong>: Element to receive focus when modal
          closes (second button)
        </li>
        <li>
          Without these props, focus defaults to the first focusable element in
          the modal
        </li>
        <li>
          Focus is trapped inside the modal while open for better accessibility
        </li>
      </ul>

      <CodeBlock>{`
// Create refs for focus management
const initialFocusRef = useRef(null);
const finalFocusRef = useRef(null);

// Use refs in Modal component
<Modal
  initialFocusRef={initialFocusRef}
  finalFocusRef={finalFocusRef}
  ...
>
  <input ref={initialFocusRef} ... />
</Modal>

<button ref={finalFocusRef}>Focus returns here</button>
			`}</CodeBlock>
    </Container>
  );
};

export const FocusManagement: Story = {
  render: () => <FocusManagementDemo />,
};

// Component wrapper for dark theme demo
const DarkThemeDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <SectionTitle>Dark Theme Support</SectionTitle>
      <SectionDescription>
        The Modal component fully supports dark theme through the ThemeProvider
        from styled-components. All colors, borders, and shadows adapt
        automatically to dark mode.
      </SectionDescription>

      <Card>
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Dark Theme Modal
        </ActionButton>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Dark Theme Modal"
        >
          <div style={{ padding: '16px' }}>
            <p>This modal uses the dark theme from the ThemeProvider.</p>
            <p>
              All styled components in the modal automatically adapt to the dark
              theme, maintaining proper contrast and visual hierarchy.
            </p>
          </div>
        </Modal>
      </Card>

      <SectionTitle style={{ fontSize: '16px', marginTop: '16px' }}>
        Theme Implementation
      </SectionTitle>
      <CodeBlock>{`
// Wrap your application with ThemeProvider
<ThemeProvider theme={darkTheme}>
  <YourApp />
</ThemeProvider>

// Modal automatically inherits theme
<Modal title="Dark Theme Modal" ... />
			`}</CodeBlock>
    </Container>
  );
};

export const DarkTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={darkTheme}>
        <div
          style={{
            padding: '1rem',
            background: '#121212',
            borderRadius: '8px',
            maxWidth: '800px',
            color: '#ffffff',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => <DarkThemeDemo />,
};

// Component wrapper for real world usage demo
const RealWorldUsageDemo: React.FC = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'movie',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // In real app, would submit data here
    setTimeout(() => setFormOpen(false), 1000);
  };

  return (
    <Container>
      <SectionTitle>Real-World Usage Examples</SectionTitle>
      <SectionDescription>
        The Modal component can be used for various purposes in PairFlix. Here
        are some common patterns:
      </SectionDescription>

      <GroupRow>
        <ItemContainer>
          <ItemLabel>Confirmation Dialog</ItemLabel>
          <div>
            <ActionButton
              onClick={() => setDeleteOpen(true)}
              style={{ backgroundColor: '#e53935' }}
            >
              Delete Movie
            </ActionButton>

            <Modal
              isOpen={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              title="Confirm Deletion"
              size="small"
              closeOnBackdropClick={false}
            >
              <div style={{ padding: '16px' }}>
                <p style={{ marginTop: 0 }}>
                  Are you sure you want to delete "The Matrix" from your
                  watchlist? This action cannot be undone.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                  }}
                >
                  <button
                    onClick={() => setDeleteOpen(false)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // In real app, would delete item here
                      setDeleteOpen(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e53935',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </ItemContainer>

        <ItemContainer>
          <ItemLabel>Share Dialog</ItemLabel>
          <div>
            <ActionButton
              onClick={() => setShareOpen(true)}
              style={{ backgroundColor: '#4caf50' }}
            >
              Share Movie
            </ActionButton>

            <Modal
              isOpen={shareOpen}
              onClose={() => setShareOpen(false)}
              title="Share 'Inception'"
              size="small"
            >
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ marginTop: 0 }}>Share this movie with friends:</p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    https://pairflix.com/movies/inception
                  </span>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '24px',
                  }}
                >
                  {['Email', 'Twitter', 'Facebook', 'WhatsApp'].map(
                    platform => (
                      <button
                        key={platform}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>
                          {platform === 'Email'
                            ? '✉️'
                            : platform === 'Twitter'
                              ? '🐦'
                              : platform === 'Facebook'
                                ? '👍'
                                : '💬'}
                        </span>
                        <span style={{ fontSize: '12px' }}>{platform}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </Modal>
          </div>
        </ItemContainer>
      </GroupRow>

      <Card>
        <SectionTitle style={{ fontSize: '16px', margin: '0 0 16px 0' }}>
          Form Modal
        </SectionTitle>

        <ActionButton
          onClick={() => {
            setFormSubmitted(false);
            setFormOpen(true);
          }}
        >
          Add New Title
        </ActionButton>

        <Modal
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          title="Add New Title"
          size="medium"
          closeOnBackdropClick={!formSubmitted}
        >
          <div style={{ padding: '16px' }}>
            {!formSubmitted ? (
              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="title"
                    style={{ display: 'block', marginBottom: '8px' }}
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="description"
                    style={{ display: 'block', marginBottom: '8px' }}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      minHeight: '100px',
                    }}
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="category"
                    style={{ display: 'block', marginBottom: '8px' }}
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>✓</div>
                <h3 style={{ margin: '0 0 8px 0' }}>
                  Title Added Successfully
                </h3>
                <p style={{ color: '#666' }}>
                  "{formData.title}" has been added to your collection.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </Card>
    </Container>
  );
};

export const RealWorldUsage: Story = {
  render: () => <RealWorldUsageDemo />,
};

// Component wrapper for accessibility demo
const AccessibilityDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <SectionTitle>Accessibility Features</SectionTitle>
      <SectionDescription>
        The Modal component is built with accessibility in mind, following WCAG
        guidelines and best practices for modal dialogs.
      </SectionDescription>

      <Card>
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Accessible Modal
        </ActionButton>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Accessibility Features"
        >
          <div style={{ padding: '16px' }}>
            <SectionTitle style={{ fontSize: '16px', margin: '0 0 16px 0' }}>
              Key Accessibility Features
            </SectionTitle>

            <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px' }}>
              <li>Proper ARIA roles (role="dialog", aria-modal="true")</li>
              <li>Focus management and focus trap when modal is open</li>
              <li>Clear focus indicators for keyboard navigation</li>
              <li>ESC key support for dismissal</li>
              <li>Screen reader announcements for modal open/close</li>
              <li>Semantic HTML structure</li>
              <li>Proper contrast ratios for text</li>
            </ul>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <ActionButton onClick={() => setIsOpen(false)}>
                Close Modal
              </ActionButton>
            </div>
          </div>
        </Modal>
      </Card>

      <GroupRow>
        <div>
          <SectionTitle style={{ fontSize: '16px' }}>
            Keyboard Navigation
          </SectionTitle>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>
              <strong>Tab</strong>: Navigate between focusable elements within
              the modal
            </li>
            <li>
              <strong>Shift+Tab</strong>: Navigate backwards between focusable
              elements
            </li>
            <li>
              <strong>Enter/Space</strong>: Activate buttons and controls
            </li>
            <li>
              <strong>ESC</strong>: Close the modal (when closeOnEsc is true)
            </li>
          </ul>
        </div>

        <div>
          <SectionTitle style={{ fontSize: '16px' }}>
            Implemented ARIA Attributes
          </SectionTitle>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>
              <code>role="dialog"</code>
            </li>
            <li>
              <code>aria-modal="true"</code>
            </li>
            <li>
              <code>aria-labelledby</code> (points to title ID)
            </li>
            <li>
              <code>aria-describedby</code> (when applicable)
            </li>
          </ul>
        </div>
      </GroupRow>

      <CodeBlock>{`
// The Modal component automatically applies these accessibility features:

// 1. Proper ARIA attributes
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title-id"
>
  <h2 id="modal-title-id">{title}</h2>
  {children}
</div>

// 2. Focus management
// - Initial focus is set to initialFocusRef or first focusable element
// - Focus is trapped within the modal
// - When closed, focus returns to finalFocusRef or triggering element
`}</CodeBlock>
    </Container>
  );
};

export const Accessibility: Story = {
  render: () => <AccessibilityDemo />,
};
