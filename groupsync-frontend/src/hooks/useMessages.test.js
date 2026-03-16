import { renderHook, act, waitFor } from '@testing-library/react';
import { useMessages } from './useMessages';

// Mock the API functions
jest.mock('../api/messages', () => ({
  listGroupMessages: jest.fn(),
  sendGroupMessage: jest.fn(),
}));

const mockListGroupMessages = require('../api/messages').listGroupMessages;
const mockSendGroupMessage = require('../api/messages').sendGroupMessage;

describe('useMessages Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loads messages on mount', async () => {
    const mockMessages = [
      { id: '1', content: 'Test message', sender: { name: 'User' }, created_at: '2023-01-01T00:00:00Z' },
    ];
    mockListGroupMessages.mockResolvedValue({
      results: mockMessages,
      next: null,
    });

    const { result } = renderHook(() => useMessages('1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockListGroupMessages).toHaveBeenCalledWith('1', { limit: 50 });
    expect(result.current.messages).toEqual(mockMessages.slice().reverse());
  });

  test('handles API error on load', async () => {
    const error = new Error('API Error');
    mockListGroupMessages.mockRejectedValue(error);

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('polls for new messages', async () => {
    const initialMessages = [{ id: '1', content: 'Initial' }];
    const updatedMessages = [
      { id: '1', content: 'Initial' },
      { id: '2', content: 'New message' },
    ];

    mockListGroupMessages
      .mockResolvedValueOnce({ results: initialMessages, next: null })
      .mockResolvedValueOnce({ results: updatedMessages, next: null });

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(mockListGroupMessages).toHaveBeenCalledTimes(2);
  });

  test('sends message successfully', async () => {
    mockListGroupMessages.mockResolvedValue({ results: [], next: null });
    const createdMessage = { id: '2', content: 'New message', sender: { name: 'Me' }, created_at: '2023-01-01T00:00:00Z' };
    mockSendGroupMessage.mockResolvedValue(createdMessage);

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.sendMessage('New message');
    });

    expect(mockSendGroupMessage).toHaveBeenCalledWith('1', 'New message');
    expect(result.current.messages).toContain(createdMessage);
  });

  test('handles send message failure', async () => {
    mockListGroupMessages.mockResolvedValue({ results: [], next: null });
    const error = new Error('Send failed');
    mockSendGroupMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.sendMessage('New message');
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.error).toEqual(error);
    // Optimistic message should be removed
    expect(result.current.messages).toHaveLength(0);
  });

  test('loads older messages', async () => {
    const initialMessages = [{ id: '2', content: 'New' }];
    const olderMessages = [{ id: '1', content: 'Old' }];
    const nextUrl = 'http://api.example.com/next';

    mockListGroupMessages
      .mockResolvedValueOnce({ results: initialMessages, next: nextUrl })
      .mockResolvedValueOnce({ results: olderMessages, next: null });

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    await act(async () => {
      await result.current.loadOlder();
    });

    expect(mockListGroupMessages).toHaveBeenCalledWith('1', { cursorUrl: nextUrl });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual(olderMessages[0]); // Older first
  });

  test('does not load older when no next URL', async () => {
    mockListGroupMessages.mockResolvedValue({ results: [], next: null });

    const { result } = renderHook(() => useMessages('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadOlder();
    });

    // Should not call API again
    expect(mockListGroupMessages).toHaveBeenCalledTimes(1);
  });
});