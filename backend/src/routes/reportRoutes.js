const express = require('express');
const { getDailyReport } = require('../services/reportService');

const router = express.Router();

router.get('/daily', async (req, res) => {
 const report = await getDailyReport(req.query.date);
 res.json(report);
});

module.exports = router;
