import { useEffect, useRef, useState } from "react";
import { createChat, getAllUsers, getChatMessages, getChats, uploadChatImage } from "../services/dashboardService";
import socket, { connectSocket, disconnectSocket, joinChat, markMessagesAsRead, sendMessage, sendTypingEvent } from "../services/socketService";
import styles from "../assets/styles/dashboard.module.css";

const Dashboard = () => {
    const [chats, setChats] = useState<Array<any>>([]);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [loadingChats, setLoadingChats] = useState<Boolean>(false);
    const [loadingChat, setLoadingChat] = useState<Boolean>(false);
    const [filteredChats, setFilteredChats] = useState<Array<any>>([]);
    const [users, setUsers] = useState<Array<any>>([]);
    const [searchString, setSearchString] = useState<any>("");
    const [newChatMode, setNewChatMode] = useState<Boolean>(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const selectedChatRef = useRef(selectedChat);
    const [newMessage, setNewMessage] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [typingUser, setTypingUser] = useState<any>(null);

    const getUserChats = async () => {
        try {
            setLoadingChats(true);
            const response = await getChats();
            if (response) {
                setChats(response.chats);
                setFilteredChats(response.chats);
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
            window.alert("Failed to load chats. Please try again.");
        } finally {
            setLoadingChats(false);
        }
    }

    const getUsers = async () => {
        try {
            const response = await getAllUsers();
            if (response) {
                setUsers(response?.users);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            window.alert("Failed to load users. Please try again.");
        }
    }

    const handleNewChatMode = () => {
        setNewChatMode(!newChatMode);
        getUsers();

    }

    const handleStartNewChat = async (participantId: string) => {
        try {
            setLoadingChat(true);
            const response = await createChat(participantId);
            if (response) {
                setSelectedChat(response.chat);
                joinChat(response.chat?._id);
                setNewChatMode(false);
                const messages = await getChatMessages(response.chat?._id);
                if (messages) {
                    setMessages(messages.messages);
                    getUserChats();
                }
            }
        } catch (error) {
            console.error("Failed to create chat:", error);
            window.alert("Failed to start chat. Please try again.");
        } finally {
            setLoadingChat(false);
        }
    }

    const handleStartExistingChat = async (chat: any) => {
        try {
            setLoadingChat(true);
            setSelectedChat(chat);
            joinChat(chat._id);
            markMessagesAsRead(chat._id);

            const messages = await getChatMessages(chat._id);
            if (messages) {
                setMessages(messages.messages);
            }
        } catch (error) {
            console.error("Failed to fetch chat messages:", error);
            window.alert("Failed to load chat messages. Please try again.");
        } finally {
            setLoadingChat(false);
        }
    }

    const getOtherParticipant = (chat: any) => {
        if (!chat) return null;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return chat?.participants[0]?.username === currentUser?.username
            ? chat.participants[1]
            : chat.participants[0];
    }

    const getCurrentUserId = () => {
        return JSON.parse(localStorage.getItem('user') || '{}')?.id;
    }

    const formatTime = (timestamp: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const Chats = () => {
        return (
            <div className={styles.chatsList}>
                {!!filteredChats && filteredChats.length > 0 ? filteredChats.map((chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    // console.log('otherParticpant:', otherParticipant);
                    return (
                        <div
                            className={`${styles.chatItem} ${selectedChat?._id === chat?._id ? styles.chatItemActive : ''}`}
                            key={chat._id}
                            onClick={() => handleStartExistingChat(chat)}
                        >
                            <div className={`${styles.chatAvatar} ${otherParticipant?.online ? styles.isOnline : ''}`}>
                                {otherParticipant?.username?.charAt(0) || '?'}
                            </div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatHeader}>
                                    <span className={styles.personName}>{otherParticipant?.username}</span>
                                    <span className={styles.lastMessageTime}>{formatTime(chat?.lastMessage?.createdAt)}</span>
                                </div>
                                <span className={styles.lastMessage}>
                                    {chat?.lastMessage?.type === 'image' ? (
                                        <>📷 Photo</>
                                    ) : (
                                        chat?.lastMessage?.content && chat.lastMessage?.content?.length > 40
                                            ? chat.lastMessage?.content?.slice(0, 40) + "..."
                                            : chat.lastMessage?.content || 'No messages yet'
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={styles.emptyState}>
                        <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className={styles.emptyStateText}>No chats yet. Start a new conversation!</span>
                    </div>
                )}
            </div>
        )
    }

    const Users = () => {
        return (
            <>
                <div className={styles.newChatHeader}>
                    <button className={styles.backBtn} onClick={handleNewChatMode}>
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span className={styles.newChatTitle}>New chat</span>
                </div>
                <div className={styles.usersList}>
                    {!!users && users.length > 0 ? users.map((user) => (
                        <div className={styles.userItem} key={user._id} onClick={() => handleStartNewChat(user._id)}>
                            <div className={styles.userAvatar}>
                                {user.username?.charAt(0) || '?'}
                            </div>
                            <span className={styles.userName}>{user.username}</span>
                        </div>
                    )) : (
                        <div className={styles.emptyState}>
                            <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className={styles.emptyStateText}>No users found</span>
                        </div>
                    )}
                </div>
            </>
        )
    }

    const Messages = () => {
        return (
            <div className={styles.chatMessages}>
                {loadingChat ? (
                    <div className={styles.loadingChat}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Loading messages...</span>
                    </div>
                ) : (
                    messages?.map((message) => {
                        const isOwnMessage = message?.sender?._id === getCurrentUserId();
                        return (
                            <div
                                className={`${styles.messageItem} ${isOwnMessage ? styles.outgoingMessage : styles.incomingMessage}`}
                                key={message._id}
                            >
                                {message?.type === 'text' ? (
                                    <span className={styles.messageContent}>{message?.content}</span>
                                ) : message?.type === 'image' ? (
                                    <img
                                        src={message?.content}
                                        alt="Shared"
                                        className={styles.messageImage}
                                    />
                                ) : null}
                                <span className={styles.timestamp}>{formatTime(message?.createdAt)}</span>
                                {isOwnMessage && (
                                    <span className={styles.readStatus}>
                                        {message?.read === true ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        )
    }

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        sendMessage(selectedChat._id, newMessage, 'text');
        setMessages([...messages, {
            _id: Math.random().toString(36).substring(7),
            chat: selectedChat._id,
            sender: {
                _id: getCurrentUserId()
            },
            content: newMessage,
            type: 'text',
            read: false,
            createdAt: new Date().toISOString()
        }])
        setNewMessage("");
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    const handleSendImage = async () => {
        if (selectedImage) {
            if (selectedImage.size > 1_000_000) {
                alert("Image size exceeds 1MB limit");
                return;
            }

            const response = await uploadChatImage(selectedImage);

            if (!response?.imageUrl) {
                alert("Image upload failed. Please try again.");
                return;
            }

            sendMessage(selectedChat._id, response?.imageUrl, 'image');
            setMessages([...messages, {
                _id: Math.random().toString(36).substring(7),
                chat: selectedChat._id,
                sender: {
                    _id: getCurrentUserId(),
                },
                content: response?.imageUrl,
                type: 'image',
                read: true,
                createdAt: new Date().toISOString()
            }])
            setSelectedImage(null);
        }
    }

    useEffect(() => {
        selectedChatRef.current = selectedChat;
        console.log(selectedChat);
        console.log('selected chat:', selectedChatRef.current);
    }, [selectedChat])

    useEffect(() => {
        console.log("New message changed:", newMessage);
        if (newMessage.trim() === "") return;

        const typingTimeout = setTimeout(() => {
            sendTypingEvent(selectedChat._id, false);
        }, 1000);

        sendTypingEvent(selectedChat._id, true);

        return () => {
            clearTimeout(typingTimeout);
        }
    }, [newMessage]);

    useEffect(() => {
        const handleReceiveMessage = (data: any) => {
            console.log("Message received:", data)
            setMessages((list) => [...list, data?.message])
            setTypingUser(null);
        }

        const handleRecieveTypingEvent = (data: any) => {
            console.log("Typing event received:", data)
            setTypingUser(data);
        }

        const handleMessagesRead = (data: any) => {
            const currentChat = selectedChatRef.current; // Use the ref here

            console.log("Messages read event received:", data);
            console.log('Current selected chat from ref:', currentChat);

            // Use currentChat for your logic
            if (data?.chatId === currentChat?._id && data?.readBy === getOtherParticipant(currentChat)?._id) {
                setMessages((prevMessages) => {
                    return prevMessages.map((msg) => ({
                        ...msg,
                        read: true
                    }));
                });
            }
        };

        const handleMessageRead = (data: any) => {
            const currentChat = selectedChatRef.current; // Use the ref here

            console.log("Message read event received:", data);
            console.log('Current selected chat from ref:', currentChat);
            console.log('other participant:', getOtherParticipant(currentChat)?._id);

            // Use currentChat for your logic
            if (data?.message?.chat === currentChat?._id && data?.message?.readBy === getOtherParticipant(currentChat)?._id) {
                console.log('chat matched')
                setMessages((prevMessages) => {
                    return prevMessages.map((msg) => ({
                        ...msg,
                        read: true
                    }));
                });
            }
        };

        const handleUserStatusUpdated = (data: any) => {
            // if (data?.userId === getOtherParticipant(selectedChat)?._id) {
            //     setSelectedParticpantStatus(data?.online);
            // }

            console.log('User Status Updated event recieved:', data);


            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            setChats((prevChats) => {
                return prevChats.map((prevChat) => {
                    if (data?.userId === getOtherParticipant(prevChat)?.id || data?.userId === getOtherParticipant(prevChat)?._id) {
                        const index =
                            prevChat.participants[0]?.username === currentUser?.username
                                ? 1
                                : 0;

                        return {
                            ...prevChat,
                            participants: prevChat.participants.map(
                                (participant: any, i: number) =>
                                    i === index
                                        ? { ...participant, online: data?.online }
                                        : participant
                            ),
                        };
                    }

                    return prevChat;
                });
            });


            setFilteredChats((prevChats) => {
                return prevChats.map((prevChat) => {
                    if (data?.userId === getOtherParticipant(prevChat)?.id || data?.userId === getOtherParticipant(prevChat)?._id) {
                        const index =
                            prevChat.participants[0]?.username === currentUser?.username
                                ? 1
                                : 0;

                        return {
                            ...prevChat,
                            participants: prevChat.participants.map(
                                (participant: any, i: number) =>
                                    i === index
                                        ? { ...participant, online: data?.online }
                                        : participant
                            ),
                        };
                    }

                    return prevChat;
                });
            });

            // console.log('selectedChat:', selectedChat)

            const selectedChat = selectedChatRef.current

            if (selectedChat) {
                console.log('updating selected chat')
                const index =
                    selectedChat?.participants[0]?.username === currentUser?.username
                        ? 1
                        : 0;
                setSelectedChat({
                    ...selectedChat,
                    participants: selectedChat?.participants.map((participant: any, i: Number) =>
                        i === index ? { ...participant, online: data?.online } : participant
                    )
                })
            }

        }

        socket.on('new_message', handleReceiveMessage)
        socket.on('user_typing', handleRecieveTypingEvent);
        socket.on('messages_read', handleMessagesRead);
        socket.on('message_read', handleMessageRead);
        socket.on('user_status', handleUserStatusUpdated);

        return () => {
            socket.off('new_message', handleReceiveMessage)
            socket.off('user_typing', handleRecieveTypingEvent);
            socket.off('messages_read', handleMessagesRead);
            socket.off('message_read', handleMessageRead);
            socket.off('user_status', handleUserStatusUpdated);
        }
    }, [socket])



    useEffect(() => {
        console.log('chats:', chats);
        console.log('filteredChats:', filteredChats);
        console.log('selectedChat:', selectedChat);
    }, [chats, filteredChats, selectedChat])

    useEffect(() => {
        if (searchString.trim() !== "") {
            const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchString.toLowerCase()));
            setFilteredChats(filteredChats);
        } else {
            setFilteredChats(chats);
        }
    }, [searchString]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (user) {
            connectSocket(user);
        }

        getUserChats();

        return () => {
            disconnectSocket();
        }
    }, [])

    return (
        <div className={`${styles.dashboard} ${selectedChat ? styles.chatOpen : ''}`}>
            {/* Left Panel - Chat List */}
            <div className={styles.leftPanel}>
                {!newChatMode && (
                    <div className={styles.header}>
                        <div className={styles.topHeader}>
                            <div className={styles.profileSection}>
                                <div className={styles.profileAvatar}>
                                    {JSON.parse(localStorage.getItem('user') || '{}')?.username?.charAt(0) || 'U'}
                                </div>
                                <span className={styles.heading}>Chats</span>
                            </div>
                            <div className={styles.headerActions}>
                                <button className={`${styles.iconBtn} ${styles.newChatBtn}`} onClick={handleNewChatMode} title="New chat">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.searchContainer}>
                            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="search"
                                className={styles.searchInput}
                                value={searchString}
                                placeholder="Search or start new chat"
                                onChange={(e) => setSearchString(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                {loadingChats ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Loading chats...</span>
                    </div>
                ) : newChatMode ? <Users /> : <Chats />}
            </div>

            {/* Right Panel - Chat Area */}
            {selectedChat ? (
                <div className={styles.rightPanel}>
                    {/* Chat Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.chatHeaderLeft}>
                            <div className={`${styles.chatHeaderAvatar} ${getOtherParticipant(selectedChat)?.online ? styles.isOnline : ''}`}>
                                {getOtherParticipant(selectedChat)?.username?.charAt(0) || '?'}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <span className={styles.participantName}>
                                    {getOtherParticipant(selectedChat)?.username}
                                </span>
                                {getOtherParticipant(selectedChat)?.online ? (
                                    <span className={styles.onlineStatus}>Active now</span>
                                ) : getOtherParticipant(selectedChat)?.lastSeen ? (
                                    <span className={styles.onlineStatus}>last seen at {formatTime(getOtherParticipant(selectedChat)?.lastSeen)}</span>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles.chatHeaderActions}>
                            <button className={styles.iconBtn} title="Search">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                            <button className={styles.iconBtn} title="More options">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <Messages />

                    {typingUser && typingUser.isTyping && typingUser.userId !== getCurrentUserId() && (
                        <div className={styles.typingIndicator}>{typingUser.username} is typing...</div>
                    )}

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className={styles.imagePreview}>
                            <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Preview"
                                className={styles.previewThumbnail}
                            />
                            <div className={styles.previewInfo}>
                                <span className={styles.previewName}>{selectedImage.name}</span>
                                <span className={styles.previewSize}>
                                    {(selectedImage.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            <button
                                className={styles.removePreview}
                                onClick={() => setSelectedImage(null)}
                                title="Remove"
                            >
                                ✕
                            </button>
                            <button className={styles.sendImageBtn} onClick={handleSendImage}>
                                Send
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    {!newChatMode && !selectedImage && (
                        <div className={styles.inputArea}>
                            <div className={styles.inputActions}>
                                <label className={styles.attachBtn} title="Attach image">
                                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                    </svg>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className={styles.fileInput}
                                        onChange={(e) => {
                                            if (e.target?.files && e.target.files.length > 0) {
                                                setSelectedImage(e.target?.files?.[0])
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <input
                                type="text"
                                className={styles.messageInput}
                                value={newMessage}
                                placeholder="Type a message"
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                            <button
                                className={styles.sendBtn}
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                title="Send message"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(2px)' }}>
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.rightPanel}>
                    <div className={styles.welcomeScreen}>
                        <svg className={styles.welcomeIcon} viewBox="0 0 24 24" stroke="url(#icon-gradient)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <h1 className={styles.welcomeTitle}>Connect Seamlessly</h1>
                        <p className={styles.welcomeText}>
                            Experience blazing fast, secure messaging across all your devices.<br />
                            Select a chat to start talking.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard;