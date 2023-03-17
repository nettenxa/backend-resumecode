const express = require("express");
const router = express.Router();
// Load Team model
const Team = require('../../models/Team');

// @route GET api/teams
// @description Get all teams
// @access Public
router.get('/', (req, res) => {
  Team.find()
    .then(teams => res.json(teams))
    .catch(err => res.status(404).json({ noteamsfound: 'No Teams found' }));
});

// @route GET api/teams/:id
// @description Get single team by id
// @access Public
router.get('/:id', (req, res) => {
  Team.findById(req.params.id)
    .then(team => res.json(team))
    .catch(err => res.status(404).json({ noteamsfound: 'No Team found' }));
});

module.exports = router;
