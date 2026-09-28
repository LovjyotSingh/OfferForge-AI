const router = require('express').Router();
const c = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/roles', c.getRoles);

router.use(protect);

router.get('/history', c.getHistory);
router.post('/start', c.startInterview);
router.get('/:id/next-question', c.getNextQuestion);
router.post('/:id/answer', c.submitAnswer);
router.post('/:id/skip', c.skipQuestion);
router.post('/:id/complete', c.completeInterview);
router.get('/:id', c.getInterview);

module.exports = router;
