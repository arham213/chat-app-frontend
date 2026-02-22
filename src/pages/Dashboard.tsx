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
    const [selectedParticipantStatus, setSelectedParticpantStatus] = useState<Boolean>(false);
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
                            <div className={styles.chatAvatar}>
                                {otherParticipant?.username?.charAt(0) || '?'}
                            </div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatHeader}>
                                    <span className={styles.personName}>{otherParticipant?.username}</span>
                                    <span>{otherParticipant?.online ? 'online' : 'offline'}</span>
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
                        <div className={styles.emptyStateIcon}>💬</div>
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
                    <button className={styles.backBtn} onClick={handleNewChatMode}>←</button>
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
                            <div className={styles.emptyStateIcon}>👥</div>
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
                                    +
                                </button>
                            </div>
                        </div>
                        <div className={styles.searchContainer}>
                            <span className={styles.searchIcon}>🔍</span>
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
                            <div className={styles.chatHeaderAvatar}>
                                {getOtherParticipant(selectedChat)?.username?.charAt(0) || '?'}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <span className={styles.participantName}>
                                    {getOtherParticipant(selectedChat)?.username}
                                </span>
                                <span className={styles.onlineStatus}>{getOtherParticipant(selectedChat)?.online ? 'online' : `last seen at ${formatTime(getOtherParticipant(selectedChat)?.lastSeen)}`}</span>
                            </div>
                        </div>
                        <div className={styles.chatHeaderActions}>
                            <button className={styles.iconBtn} title="Search">🔍</button>
                            <button className={styles.iconBtn} title="More options">⋮</button>
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
                                    📎
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
                                ➤
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.rightPanel}>
                    <div className={styles.welcomeScreen}>
                        <svg className={styles.welcomeIcon} viewBox="0 0 303 172" width="360" height="200">
                            <path fill="#00a884" d="M229.565 160.229c32.647-29.527 53.218-72.317 53.218-119.869C282.783 18.075 264.708 0 242.423 0c-22.285 0-40.36 18.075-40.36 40.36 0 22.285 18.075 40.36 40.36 40.36 6.12 0 11.921-1.367 17.122-3.815-8.658 32.714-29.025 61.095-56.48 79.324zM60.134 81.161c22.285 0 40.36-18.075 40.36-40.36C100.494 18.516 82.419.441 60.134.441c-22.285 0-40.36 18.075-40.36 40.36 0 22.285 18.075 40.36 40.36 40.36z" />
                            <path fill="#364147" d="M230.063 160.727c-42.466 12.392-89.951 1.661-123.377-32.765-52.089-53.685-50.678-139.319 3.155-191.26 26.296-25.392 60.86-38.283 95.384-38.614-14.076-.251-28.192 1.809-41.843 6.205-45.147 14.55-79.122 53.476-86.74 101.106a132.867 132.867 0 0 0 8.095 67.837c12.023 31.472 35.907 58.02 67.668 72.847 31.761 14.828 67.32 17.048 100.563 6.282z" />
                        </svg>
                        <h1 className={styles.welcomeTitle}>WhatsApp Web</h1>
                        <p className={styles.welcomeText}>
                            Send and receive messages without keeping your phone online.<br />
                            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard;