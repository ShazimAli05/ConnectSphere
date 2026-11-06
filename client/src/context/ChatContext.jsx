import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // conversationId -> Array<{ _id, name }>

  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  // Load conversations on mount or user change
  const fetchConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const res = await chatService.getConversations();
      if (res.success) {
        setConversations(res.conversations);
        // If there's an active conversation, update its reference
        if (activeConvRef.current) {
          const updated = res.conversations.find((c) => c._id === activeConvRef.current._id);
          if (updated) setActiveConversation(updated);
        }
      }
    } catch (err) {
      console.error('[Chat] Failed to fetch conversations:', err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?._id]);

  // Handle active conversation message fetching and socket room joining
  useEffect(() => {
    if (!activeConversation || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatService.getMessages(activeConversation._id);
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('[Chat] Failed to load messages:', err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join Socket room
    if (socket && isConnected) {
      socket.emit('join_conversation', activeConversation._id);
      socket.emit('mark_as_read', { conversationId: activeConversation._id });
    }

    return () => {
      if (socket && isConnected) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket, isConnected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      // If belongs to currently open conversation, append to messages
      if (activeConvRef.current?._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Mark as read immediately
        socket.emit('mark_as_read', {
          conversationId,
          messageIds: [message._id],
        });
      }

      // Update lastMessage and bump conversation to top
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === conversationId);
        if (index === -1) {
          fetchConversations();
          return prev;
        }

        const conv = { ...prev[index] };
        conv.lastMessage = message;
        conv.updatedAt = message.createdAt;

        // If not in active conversation and sender is not current user, increment unread count
        if (
          activeConvRef.current?._id !== conversationId &&
          message.sender?._id !== user?._id
        ) {
          const currentCount = conv.unreadCounts?.[user?._id] || 0;
          conv.unreadCounts = {
            ...(conv.unreadCounts || {}),
            [user?._id]: currentCount + 1,
          };
        }

        const reordered = [...prev];
        reordered.splice(index, 1);
        return [conv, ...reordered];
      });
    };

    const handleMessageUpdated = ({ conversationId, message }) => {
      if (activeConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? message : m))
        );
      }
    };

    const handleMessageDeleted = ({ conversationId, messageId }) => {
      if (activeConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] }
              : m
          )
        );
      }
    };

    const handleMessageRead = ({ conversationId, userId, messageIds }) => {
      if (activeConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds && messageIds.includes(m._id)) {
              const alreadyRead = m.readBy?.some((r) => r.user === userId || r.user?._id === userId);
              if (!alreadyRead) {
                return {
                  ...m,
                  readBy: [...(m.readBy || []), { user: userId, readAt: new Date() }],
                };
              }
            }
            return m;
          })
        );
      }
    };

    const handleTyping = ({ conversationId, user: typingUser }) => {
      setTypingUsers((prev) => {
        const list = prev[conversationId] || [];
        if (list.some((u) => u._id === typingUser._id)) return prev;
        return {
          ...prev,
          [conversationId]: [...list, typingUser],
        };
      });
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.filter((u) => u._id !== userId),
        };
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_read', handleMessageRead);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_read', handleMessageRead);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, user?._id]);

  // Actions
  const selectConversation = (conv) => {
    setActiveConversation(conv);
    setReplyMessage(null);
    setEditingMessage(null);

    // Clear unread count locally
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === conv._id) {
          const unreads = { ...(c.unreadCounts || {}) };
          if (user?._id) unreads[user._id] = 0;
          return { ...c, unreadCounts: unreads };
        }
        return c;
      })
    );
  };

  const sendMessage = async ({ content, attachments = [], replyTo = null, messageType = 'text' }) => {
    if (!activeConversation) return;

    try {
      const payload = {
        conversationId: activeConversation._id,
        content,
        attachments,
        replyTo: replyTo || (replyMessage ? replyMessage._id : null),
        messageType,
      };

      // Call REST API
      const res = await chatService.sendMessage(payload);
      if (res.success && res.message) {
        setReplyMessage(null);
        // If socket is connected, broadcast it
        if (socket && isConnected) {
          socket.emit('send_message', payload);
        } else {
          // If socket disconnected, manually append
          setMessages((prev) => [...prev, res.message]);
        }
        return res.message;
      }
    } catch (err) {
      console.error('[Chat] Error sending message:', err.message);
      throw err;
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const res = await chatService.editMessage(messageId, newContent);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.message : m))
        );
        if (socket && isConnected && activeConversation) {
          socket.emit('message_updated', {
            conversationId: activeConversation._id,
            message: res.message,
          });
        }
        setEditingMessage(null);
        return res.message;
      }
    } catch (err) {
      console.error('[Chat] Failed to edit message:', err.message);
      throw err;
    }
  };

  const deleteMessage = async (messageId, deleteForEveryone = false) => {
    try {
      const res = await chatService.deleteMessage(messageId, deleteForEveryone);
      if (res.success) {
        if (deleteForEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] }
                : m
            )
          );
          if (socket && isConnected && activeConversation) {
            socket.emit('message_deleted', {
              conversationId: activeConversation._id,
              messageId,
            });
          }
        } else {
          // Deleted for me only: remove from view
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      }
    } catch (err) {
      console.error('[Chat] Failed to delete message:', err.message);
      throw err;
    }
  };

  const toggleReaction = async (messageId, emoji) => {
    try {
      const res = await chatService.toggleReaction(messageId, emoji);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.message : m))
        );
        if (socket && isConnected && activeConversation) {
          socket.emit('message_updated', {
            conversationId: activeConversation._id,
            message: res.message,
          });
        }
      }
    } catch (err) {
      console.error('[Chat] Failed to toggle reaction:', err.message);
    }
  };

  const emitTyping = (isTyping) => {
    if (!socket || !isConnected || !activeConversation) return;
    if (isTyping) {
      socket.emit('typing', { conversationId: activeConversation._id });
    } else {
      socket.emit('stop_typing', { conversationId: activeConversation._id });
    }
  };

  const startDirectChat = async (recipientId) => {
    try {
      const res = await chatService.startDirectConversation(recipientId);
      if (res.success && res.conversation) {
        // Check if exists in list
        const exists = conversations.some((c) => c._id === res.conversation._id);
        if (!exists) {
          setConversations((prev) => [res.conversation, ...prev]);
        }
        setActiveConversation(res.conversation);
        return res.conversation;
      }
    } catch (err) {
      console.error('[Chat] Failed to start direct chat:', err.message);
      throw err;
    }
  };

  const createGroup = async (groupData) => {
    try {
      const res = await chatService.createGroup(groupData);
      if (res.success && res.conversation) {
        setConversations((prev) => [res.conversation, ...prev]);
        setActiveConversation(res.conversation);
        return res.conversation;
      }
    } catch (err) {
      console.error('[Chat] Failed to create group:', err.message);
      throw err;
    }
  };

  const leaveGroup = async (conversationId) => {
    try {
      const res = await chatService.removeGroupMember(conversationId, user._id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversation?._id === conversationId) {
          setActiveConversation(null);
        }
      }
    } catch (err) {
      console.error('[Chat] Failed to leave group:', err.message);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        replyMessage,
        setReplyMessage,
        editingMessage,
        setEditingMessage,
        typingUsers: activeConversation ? typingUsers[activeConversation._id] || [] : [],
        selectConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        emitTyping,
        startDirectChat,
        createGroup,
        leaveGroup,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
