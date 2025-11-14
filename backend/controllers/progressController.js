const Observation = require('../models/Observation');
const Constellation = require('../models/Constellation');

exports.getUserProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total constellations
    const totalConstellations = await Constellation.countDocuments();

    // User's unique observed constellations
    const observations = await Observation.find({ userId }).distinct(
      'constellationId'
    );
    const seenCount = observations.length;

    // Calculate percentage
    const percentage = Math.round((seenCount / totalConstellations) * 100);

    // Get recent observations
    const recentObservations = await Observation.find({ userId })
      .sort({ observationDate: -1 })
      .limit(5)
      .populate('constellationId', 'name');

    // Calculate streak (consecutive days with observations)
    const allObservations = await Observation.find({ userId })
      .sort({ observationDate: -1 })
      .select('observationDate');

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const obs of allObservations) {
      const obsDate = new Date(obs.observationDate);
      obsDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate - obsDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    res.json({
      totalConstellations,
      seenCount,
      percentage,
      streak,
      recentObservations,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};
