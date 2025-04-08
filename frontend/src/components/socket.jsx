import { useSocket } from "../context/socketcontext";
import "../CSS/socket.css";

function Socket() {
  const { setRoom, joined, setJoined, username, room, setUsername, joinRoom } =
    useSocket();

  if (!setUsername || !setRoom) {
    console.error(
      "Socket Context is not initialized properly. Ensure SocketProvider wraps this component."
    );
    return <p>Error: Socket context not found.</p>;
  }

  return (
    <>
      <div className="container">
        {!joined && (
          <div className="room-container">
            <h2>Join a Room</h2>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={joinRoom}>Join</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Socket;
