import express from 'express';
import Attendee from '../models/Attendee.js';
import Event from '../models/Event.js';
import Jar from '../models/Jar.js';

const router = express.Router();

// Create or update attendee profile to join a room
router.post('/', async (req, res) => {
  try {
    const { eventCode, name, role, company, email, interests, goals, avatar } = req.body;

    if (!eventCode || !name || !role || !company || !email || !goals) {
      return res.status(400).json({ message: 'Missing required attendee fields.' });
    }

    // Find the event
    const event = await Event.findOne({ code: eventCode });
    if (!event) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Check if attendee with this email already joined this event
    let attendee = await Attendee.findOne({ eventId: event._id, email });

    if (attendee) {
      // Update existing attendee profile
      attendee.name = name;
      attendee.role = role;
      attendee.company = company;
      attendee.interests = interests || [];
      attendee.goals = goals;
      if (avatar) attendee.avatar = avatar;
      attendee.isOnline = true;
      await attendee.save();
    } else {
      // Create new attendee
      attendee = new Attendee({
        eventId: event._id,
        name,
        role,
        company,
        email,
        interests: interests || [],
        goals,
        avatar: avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(name)}`,
        isOnline: true
      });
      await attendee.save();
    }

    res.status(201).json(attendee);
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Server error joining room.', error: error.message });
  }
});

// Get attendee details by ID, including their current Jar
router.get('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found.' });
    }

    // Find if they are in any jar
    const jar = await Jar.findOne({ eventId: attendee.eventId, memberIds: attendee._id });

    res.json({
      ...attendee.toObject(),
      jar: jar ? { _id: jar._id, label: jar.label, reason: jar.reason } : null
    });
  } catch (error) {
    console.error('Error fetching attendee details:', error);
    res.status(500).json({ message: 'Server error fetching attendee details.', error: error.message });
  }
});

// Get all attendees for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const attendees = await Attendee.find({ eventId: req.params.eventId }).sort({ joinedAt: -1 });
    res.json(attendees);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({ message: 'Server error fetching event attendees.', error: error.message });
  }
});

export default router;
