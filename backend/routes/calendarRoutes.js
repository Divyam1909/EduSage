const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractEventsFromPDF } = require('../pdfParser');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth'); // Import authentication middleware

// Keep PDF uploads in memory: they are only parsed, never stored
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Route to upload and process PDF
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`Processing PDF file: ${req.file.originalname}`);
    const pdfBuffer = req.file.buffer;
    
    // Extract events from the uploaded PDF
    const events = await extractEventsFromPDF(pdfBuffer);
    
    if (!events || events.length === 0) {
      return res.status(400).json({ error: 'No events could be extracted from the PDF' });
    }
    
    console.log(`Extracted ${events.length} events, saving to database...`);
    
    // Save all events to the database
    const savedEvents = [];
    for (const event of events) {
      // Ensure title is not too long (max 25 chars)
      let title = event.title;
      let details = event.details || '';
      
      if (title.length > 25) {
        // Move the full title to details if it's too long
        const fullTitle = title;
        title = title.substring(0, 22) + "...";
        if (!details.includes(fullTitle)) {
          details = `Full title: ${fullTitle}\n\n${details}`.trim();
        }
      }
      
      // Ensure notification settings are correct (all enabled for PDF events)
      const notifications = event.notifications || {
        dayBefore: true,
        dayOf: true,
        atTime: false
      };
      
      // Make sure all day-based notifications are enabled for PDF events
      notifications.dayBefore = true;
      notifications.dayOf = true;
      
      const notificationStatus = event.notificationStatus || {
        dayBeforeSent: false,
        dayOfSent: false,
        atTimeSent: false
      };
      
      const newEvent = new Event({
        title: title,
        date: event.date,
        details: details,
        userId: req.user.rollno, // Use rollno from JWT token instead of id
        importedFromPdf: true,
        notifications: notifications,
        notificationStatus: notificationStatus
      });
      
      try {
        const saved = await newEvent.save();
        savedEvents.push(saved);
      } catch (saveError) {
        console.error(`Error saving event "${event.title}":`, saveError);
      }
    }
    
    return res.status(200).json({
      message: `Successfully processed PDF and imported ${savedEvents.length} events`,
      events: savedEvents
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json({ error: 'Error processing PDF', details: error.message });
  }
});

// Add an alternative route that matches the frontend route
router.post('/upload-pdf', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`Processing PDF file: ${req.file.originalname}`);
    const pdfBuffer = req.file.buffer;
    
    // Extract events from the uploaded PDF
    const events = await extractEventsFromPDF(pdfBuffer);
    
    if (!events || events.length === 0) {
      return res.status(400).json({ error: 'No events could be extracted from the PDF' });
    }
    
    console.log(`Extracted ${events.length} events, saving to database...`);
    
    // Save all events to the database
    const savedEvents = [];
    for (const event of events) {
      // Ensure title is not too long (max 25 chars)
      let title = event.title;
      let details = event.details || '';
      
      if (title.length > 25) {
        // Move the full title to details if it's too long
        const fullTitle = title;
        title = title.substring(0, 22) + "...";
        if (!details.includes(fullTitle)) {
          details = `Full title: ${fullTitle}\n\n${details}`.trim();
        }
      }
      
      // Ensure notification settings are correct (all enabled for PDF events)
      const notifications = event.notifications || {
        dayBefore: true,
        dayOf: true,
        atTime: false
      };
      
      // Make sure all day-based notifications are enabled for PDF events
      notifications.dayBefore = true;
      notifications.dayOf = true;
      
      const notificationStatus = event.notificationStatus || {
        dayBeforeSent: false,
        dayOfSent: false,
        atTimeSent: false
      };
      
      const newEvent = new Event({
        title: title,
        date: event.date,
        details: details,
        userId: req.user.rollno, // Use rollno from JWT token instead of id
        importedFromPdf: true,
        notifications: notifications,
        notificationStatus: notificationStatus
      });
      
      try {
        const saved = await newEvent.save();
        savedEvents.push(saved);
      } catch (saveError) {
        console.error(`Error saving event "${event.title}":`, saveError);
      }
    }
    
    return res.status(200).json({
      message: `Successfully processed PDF and imported ${savedEvents.length} events`,
      events: savedEvents
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json({ error: 'Error processing PDF', details: error.message });
  }
});

// Route to delete all PDF-imported events
router.delete('/pdf-events', authenticateToken, async (req, res) => {
  try {
    // Only delete PDF events for the authenticated user
    const result = await Event.deleteMany({ 
      importedFromPdf: true,
      userId: req.user.rollno 
    });
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} PDF-imported events`,
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting PDF events:', error);
    return res.status(500).json({ error: 'Error deleting PDF events', details: error.message });
  }
});

// Export the router
module.exports = router; 