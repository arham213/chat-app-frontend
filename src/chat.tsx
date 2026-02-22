import axios from "axios"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

const socket = io('http://localhost:8080')

interface MessageData {
    roomId: string,
    author: string,
    message: string,
    time: string
}

const Chat = ({ socket, username, roomId }: { socket: Socket, username: string, roomId: string }) => {
    const [currentMessage, setCurrentMessage] = useState("")
    const [messageList, setMessageList] = useState<MessageData[]>([])

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData: MessageData = {
                roomId,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()
            }

            socket.emit('send_message', messageData)

            setMessageList((list) => [...list, messageData])
            setCurrentMessage("")
        }
    }

    useEffect(() => {
        const handleReceiveMessage = (data: MessageData) => {
            console.log("Message received:", data)
            setMessageList((list) => [...list, data])
        }

        socket.on('recieve_message', handleReceiveMessage)

        return () => {
            socket.off('recieve_message', handleReceiveMessage)
        }
    }, [socket])

    const getChat = async () => {
        const response = await axios.get(`http://localhost:8080/getChat${roomId}`);

        if (response) {
            setMessageList(response.data.messages)
        }
    }

    useEffect(() => {
        getChat();
    }, [])

    return (
        <div className="chat-window" style={{ maxWidth: "400px", margin: "20px auto", border: "1px solid #ccc" }}>
            <div className="chat-header" style={{ background: "#333", color: "#fff", padding: "10px" }}>
                <p>Live Chat - Room: {roomId}</p>
            </div>

            <div className="chat-body" style={{ height: "300px", overflowY: "scroll", padding: "10px" }}>
                {messageList.map((msg, index) => {
                    const isMe = username === msg.author
                    return (
                        <div key={index} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "5px" }}>
                            <div style={{ background: isMe ? "#4caf50" : "#eee", color: isMe ? "white" : "black", padding: "5px 10px", borderRadius: "5px" }}>
                                <p style={{ margin: 0 }}>{msg.message}</p>
                                <div style={{ fontSize: "0.7rem", marginTop: "3px", textAlign: "right" }}>
                                    <span>{msg.time}</span> <b style={{ marginLeft: "5px" }}>{msg.author}</b>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="chat-footer" style={{ display: "flex", borderTop: "1px solid #ccc" }}>
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Hey..."
                    onChange={(event) => setCurrentMessage(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                    style={{ flex: 1, padding: "10px", border: "none" }}
                />
                <button onClick={sendMessage} style={{ padding: "10px", border: "none", background: "#333", color: "white", cursor: "pointer" }}>
                    &#9658;
                </button>
            </div>
        </div>
    )
}

const App = () => {
    const [username, setUsername] = useState("")
    const [roomId, setRoomId] = useState("")
    const [showChat, setShowChat] = useState<boolean>(false)

    const joinChatRoom = () => {
        if (username !== "" && roomId !== "") {
            socket.emit('join_chat_room', roomId)
            setShowChat(true)
        }
    }

    return (
        <>
            {!showChat ? (
                <section style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    height: "100vh"
                }}>
                    <input style={{
                        border: "1px solid #000"
                    }} type="text" name="username" value={username} onChange={(e: any) => setUsername(e.target.value)} />
                    <input style={{
                        border: "1px solid #000"
                    }} type="text" name="roomId" value={roomId} onChange={(e: any) => setRoomId(e.target.value)} />

                    <button onClick={joinChatRoom}>Join Chat Room</button>
                </section>
            ) : <Chat socket={socket} username={username} roomId={roomId} />}
        </>
    )
}

export default App