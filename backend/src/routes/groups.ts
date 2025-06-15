import { Router } from 'express';
import {
	acceptGroupInvitation,
	addToGroupWatchlist,
	createGroup,
	createRelationship,
	declineGroupInvitation,
	expandRelationship,
	getGroupContentMatches,
	getGroupInvitations,
	getPrimaryRelationship,
	getUserGroups,
	inviteToGroup,
} from '../controllers/group.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All group routes require authentication
router.use(authenticateToken);

// Primary relationship management (for frontend with one relationship)
router.post('/relationship', createRelationship);
router.get('/relationship', getPrimaryRelationship);

// Group management (for advanced users)
router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/invitations', getGroupInvitations);

// Group expansion and modification
router.put('/:group_id/expand', expandRelationship);

// Group membership
router.post('/:group_id/invite', inviteToGroup);
router.post('/:group_id/accept', acceptGroupInvitation);
router.post('/:group_id/decline', declineGroupInvitation);

// Group content
router.get('/:group_id/matches', getGroupContentMatches);
router.post('/:group_id/watchlist', addToGroupWatchlist);

export default router;
