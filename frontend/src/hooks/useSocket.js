import { useEffect } from "react";
import { getSocket } from "../sockets";

export default function useSocket(events, handler) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [events, handler]);
}
