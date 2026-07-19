import Attendee from '../models/Attendee.js';

// Dictionary to track active disconnection timeouts to handle rapid reconnects (refreshes)
const disconnectTimeouts = {};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle joining an event room
    socket.on('join_room', async ({ eventId, attendeeId }) => {
      try {
        if (!eventId || !attendeeId) return;

        socket.eventId = eventId;
        socket.attendeeId = attendeeId;

        // Cancel any pending disconnect timeout for this attendee (if page refreshed)
        if (disconnectTimeouts[attendeeId]) {
          clearTimeout(disconnectTimeouts[attendeeId]);
          delete disconnectTimeouts[attendeeId];
        }

        // Join Socket.io room
        const roomName = `room:${eventId}`;
        socket.join(roomName);

        // Update attendee database entry to online and save socket ID
        await Attendee.findByIdAndUpdate(attendeeId, {
          isOnline: true,
          socketId: socket.id
        });

        console.log(`Attendee ${attendeeId} joined room ${roomName} via socket ${socket.id}`);

        // Broadcast updated room attendees to all clients in the room
        await broadcastRoomUpdate(io, eventId);
      } catch (error) {
        console.error('Error in join_room socket event:', error);
      }
    });

    // Handle manual note added or jar updated triggers (backup sync triggers)
    socket.on('trigger_room_sync', async ({ eventId }) => {
      if (eventId) {
        await broadcastRoomUpdate(io, eventId);
      }
    });

    // Handle disconnecting
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      const { eventId, attendeeId } = socket;

      if (eventId && attendeeId) {
        // Debounce database offline status by 3 seconds to handle page refreshes seamlessly
        disconnectTimeouts[attendeeId] = setTimeout(async () => {
          try {
            // Confirm the attendee hasn't reconnected on a new socket in the meantime
            const attendeeInstance = await Attendee.findById(attendeeId);
            if (attendeeInstance && attendeeInstance.socketId === socket.id) {
              await Attendee.findByIdAndUpdate(attendeeId, {
                isOnline: false,
                socketId: null
              });
              
              console.log(`Attendee ${attendeeId} marked offline after disconnect debounce.`);
              
              // Broadcast update to the remaining users in the room
              await broadcastRoomUpdate(io, eventId);
            }
            
            delete disconnectTimeouts[attendeeId];
          } catch (error) {
            console.error('Error during deferred socket disconnect processing:', error);
          }
        }, 3000);
      }
    });
  });
};

/**
 * Broadcasts list of attendees and current online count to a room
 */
export const broadcastRoomUpdate = async (io, eventId) => {
  try {
    const attendees = await Attendee.find({ eventId }).sort({ name: 1 });
    const onlineCount = attendees.filter(a => a.isOnline).length;
    
    io.to(`room:${eventId}`).emit('room_updated', {
      attendees,
      onlineCount
    });
  } catch (error) {
    console.error('Error broadcasting room update:', error);
  }
};

export default socketHandler;
