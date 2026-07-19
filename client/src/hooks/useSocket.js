import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export const useSocket = (eventId, attendeeId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [jars, setJars] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!eventId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected to server');
      
      // If we have an attendee, join the room immediately
      if (attendeeId) {
        socket.emit('join_room', { eventId, attendeeId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected from server');
    });

    // Room update event (triggered when anyone joins or disconnects)
    socket.on('room_updated', ({ attendees: updatedAttendees, onlineCount: count }) => {
      setAttendees(updatedAttendees);
      setOnlineCount(count);
    });

    // Jars update event (triggered when AI grouping finishes)
    socket.on('jars_updated', (updatedJars) => {
      setJars(updatedJars);
    });

    // Room Wall events
    socket.on('note_added', (newNote) => {
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    });

    socket.on('note_updated', (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [eventId, attendeeId]);

  // Re-join if attendee ID is provided/updated dynamically
  const joinRoom = (newAttendeeId) => {
    if (socketRef.current && isConnected && eventId && newAttendeeId) {
      socketRef.current.emit('join_room', { eventId, attendeeId: newAttendeeId });
    }
  };

  const triggerSync = () => {
    if (socketRef.current && isConnected && eventId) {
      socketRef.current.emit('trigger_room_sync', { eventId });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    attendees,
    onlineCount,
    jars,
    setJars,
    notes,
    setNotes,
    joinRoom,
    triggerSync
  };
};
