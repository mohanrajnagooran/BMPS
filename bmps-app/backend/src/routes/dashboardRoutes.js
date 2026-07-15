const express = require('express');
const auth = require('../middleware/auth');

const Client = require('../models/Client');
const ClientCompany = require('../models/ClientCompany');
const Agent = require('../models/Agent');
const JobDemand = require('../models/JobDemand');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const Worker = require('../models/Worker');
const Case = require('../models/Case');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const router = express.Router();
router.use(auth);

router.get('/summary', async (req, res) => {
  try {
    const [
      totalClients, totalCompanies, totalAgents,
      openJobDemands, activeCandidates, applicationsInProgress,
      activeWorkers, openCases, urgentCases,
      myPendingTasks, overdueTasks, unreadNotifications,
      applicationsByStatus
    ] = await Promise.all([
      Client.countDocuments({ status: 'Active' }),
      ClientCompany.countDocuments({ status: 'Active' }),
      Agent.countDocuments({ status: 'Active' }),
      JobDemand.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      Candidate.countDocuments({ status: { $nin: ['Rejected', 'Withdrawn'] } }),
      Application.countDocuments({ currentStatus: { $nin: ['Active Worker', 'Rejected', 'Cancelled'] } }),
      Worker.countDocuments({ status: 'Active' }),
      Case.countDocuments({ status: { $in: ['Open', 'In Progress', 'Escalated'] } }),
      Case.countDocuments({ priority: 'Urgent', status: { $ne: 'Closed' } }),
      Task.countDocuments({ assignedTo: req.user.id, status: { $in: ['Pending', 'In Progress'] } }),
      Task.countDocuments({ assignedTo: req.user.id, status: 'Overdue' }),
      Notification.countDocuments({ recipient: req.user.id, status: 'Unread' }),
      Application.aggregate([{ $group: { _id: '$currentStatus', count: { $sum: 1 } } }])
    ]);

    res.json({
      cards: {
        totalClients, totalCompanies, totalAgents,
        openJobDemands, activeCandidates, applicationsInProgress,
        activeWorkers, openCases, urgentCases,
        myPendingTasks, overdueTasks, unreadNotifications
      },
      applicationsByStatus
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard summary.', error: err.message });
  }
});

module.exports = router;
