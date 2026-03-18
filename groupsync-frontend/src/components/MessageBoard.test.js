import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBoard from './MessageBoard';

// Mock scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// Mock the hooks and components
jest.mock('../hooks/useMessages', () => ({
  useMessages: jest.fn(),
}));

jest.mock('./MessageList', () => {
  return function MockMessageList({ messages }) {
    return (
      <div data-testid="message-list">
        {messages.map((msg) => (
          <div key={msg.id} data-testid={`message-${msg.id}`}>
            {msg.content}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('./MessageComposer', () => {
  return function MockMessageComposer({ onSend, disabled }) {
    return (
      <div data-testid="message-composer">
        <input
          data-testid="message-input"
          disabled={disabled}
          defaultValue=""
        />
        <button
          data-testid="send-button"
          disabled={disabled}
          onClick={() => onSend('Test message')}
        >
          Send
        </button>
      </div>
    );
  };
});

const mockUseMessages = require('../hooks/useMessages').useMessages;

describe('MessageBoard Component', () => {
  const mockGroupId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: true,
      error: null,
      sendMessage: jest.fn(),
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    expect(screen.getByText('Loading older messages...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to load messages';
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: false,
      error: new Error(errorMessage),
      sendMessage: jest.fn(),
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    expect(screen.getByText(`Error loading messages: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders messages correctly', () => {
    const mockMessages = [
      { id: '1', content: 'Hello', sender: { name: 'User1' }, created_at: '2023-01-01T00:00:00Z' },
      { id: '2', content: 'World', sender: { name: 'User2' }, created_at: '2023-01-01T00:01:00Z' },
    ];

    mockUseMessages.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      error: null,
      sendMessage: jest.fn(),
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    expect(screen.getByTestId('message-1')).toHaveTextContent('Hello');
    expect(screen.getByTestId('message-2')).toHaveTextContent('World');
  });

  test('handles sending message successfully', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue();
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      sendMessage: mockSendMessage,
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    const sendButton = screen.getByTestId('send-button');

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    // Check success message appears
    await waitFor(() => {
      expect(screen.getByText('Message sent.')).toBeInTheDocument();
    });

    // Success message should disappear after 3 seconds
    await waitFor(() => {
      expect(screen.queryByText('Message sent.')).not.toBeInTheDocument();
    }, { timeout: 3500 });
  });

  test('handles sending message failure', async () => {
    const mockSendMessage = jest.fn().mockRejectedValue(new Error('Send failed'));
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      sendMessage: mockSendMessage,
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    const sendButton = screen.getByTestId('send-button');

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    // Error should be logged (we can't easily test console.error, but optimistic update should be reverted)
  });

  test('loads older messages when button clicked', async () => {
    const mockLoadOlder = jest.fn();
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      sendMessage: jest.fn(),
      loadOlder: mockLoadOlder,
    });

    render(<MessageBoard groupId={mockGroupId} />);

    const loadButton = screen.getByText('Load older messages');
    fireEvent.click(loadButton);

    expect(mockLoadOlder).toHaveBeenCalled();
  });

  test('keeps send enabled while loading older messages', () => {
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoading: true,
      error: null,
      sendMessage: jest.fn(),
      loadOlder: jest.fn(),
    });

    render(<MessageBoard groupId={mockGroupId} />);

    const sendButton = screen.getByTestId('send-button');
    const input = screen.getByTestId('message-input');

    expect(sendButton).toBeEnabled();
    expect(input).toBeEnabled();
  });
});