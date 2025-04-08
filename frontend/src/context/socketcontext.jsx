import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

const socket = io.connect("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true,
});

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [Snap, setSnap] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const snapHandler = ({ img, x, y, username }) => {
      setSnap(img);
      setUsers((prev) => {
        const index = prev.findIndex((user) => user.username === username);

        if (index !== -1) {
          // User exists — update
          return prev.map((user) =>
            user.username === username ? { ...user, x, y } : user
          );
        } else {
          // User doesn't exist — add new
          return [...prev, { username, x, y }];
        }
      });
    };

    const typingHandler = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(username)) {
          return [...prev, username];
        } else if (!isTyping) {
          return prev.filter((user) => user !== username);
        }
        return prev;
      });
    };

    socket.on("receive_message", messageHandler);
    socket.on("receive_snap", snapHandler);
    socket.on("typing", typingHandler);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("receive_snap", snapHandler);
      socket.off("typing", typingHandler);
    };
  }, []);

  const joinRoom = () => {
    if (room.trim() && username.trim()) {
      socket.emit("join_room", { room, username });
      setJoined(true);
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: `You joined room ${room}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const sendMessage = () => {
    if (message.trim() && room) {
      const messageData = {
        sender: username,
        content: message,
        room,
        timestamp: new Date().toISOString(),
        type: "user_message",
      };
      socket.emit("send_message", messageData);
      setMessage("");

      // Notify server that user stopped typing
      if (isTyping) {
        socket.emit("typing", { room, username, isTyping: false });
        setIsTyping(false);
      }
    }
  };

  const sendSnap = (x, y, img) => {
    if (img) {
      socket.emit("send_snap", { x, y, img, room, username });
      setSnap("");
    }
  };

  return (
    <SocketContext.Provider
      value={{
        users,
        socket,
        messages,
        setMessages,
        room,
        setRoom,
        username,
        setUsername,
        joined,
        setJoined,
        joinRoom,
        message,
        setMessage,
        sendMessage,
        Snap,
        setSnap,
        sendSnap,
        isTyping,
        setIsTyping,
        typingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
