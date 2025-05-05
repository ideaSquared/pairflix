import { Response } from 'express';
import { Op } from 'sequelize';
import Match from '../models/Match';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

export const getMatches = async (req: AuthenticatedRequest, res: Response) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const matches = await Match.findAll({
			where: {
				[Op.or]: [{ user1_id: user_id }, { user2_id: user_id }],
			},
			include: [
				{ model: User, as: 'user1', attributes: ['email'] },
				{ model: User, as: 'user2', attributes: ['email'] },
			],
		});

		res.json(matches);
	} catch (error) {
		console.error('Get matches error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const createMatch = async (req: AuthenticatedRequest, res: Response) => {
	const user1_id = req.user?.user_id;
	const { user2_id } = req.body;

	if (!user1_id) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		// Check if either user already has an active match
		const existingMatch = await Match.findOne({
			where: {
				[Op.or]: [
					{ user1_id: [user1_id, user2_id], status: 'accepted' },
					{ user2_id: [user1_id, user2_id], status: 'accepted' },
				],
			},
		});

		if (existingMatch) {
			return res
				.status(400)
				.json({ error: 'One of the users already has an active match' });
		}

		// Check if these users already have a pending match
		const pendingMatch = await Match.findOne({
			where: {
				[Op.or]: [
					{ user1_id, user2_id, status: 'pending' },
					{ user1_id: user2_id, user2_id: user1_id, status: 'pending' },
				],
			},
		});

		if (pendingMatch) {
			return res.status(400).json({ error: 'Match request already exists' });
		}

		const match = await Match.create({
			user1_id,
			user2_id,
			status: 'pending',
		});

		res.status(201).json(match);
	} catch (error) {
		console.error('Create match error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateMatchStatus = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const user_id = req.user?.user_id;
	const { match_id } = req.params;
	const { status } = req.body;

	if (!user_id) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const match = await Match.findByPk(match_id);

		if (!match) {
			return res.status(404).json({ error: 'Match not found' });
		}

		// Only allow user2 to update the status
		if (match.user2_id !== user_id) {
			return res
				.status(403)
				.json({ error: 'Not authorized to update this match' });
		}

		if (!['accepted', 'rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		// If accepting, check if either user already has an active match
		if (status === 'accepted') {
			const existingMatch = await Match.findOne({
				where: {
					[Op.and]: [
						{ match_id: { [Op.ne]: match_id } },
						{
							[Op.or]: [
								{
									user1_id: [match.user1_id, match.user2_id],
									status: 'accepted',
								},
								{
									user2_id: [match.user1_id, match.user2_id],
									status: 'accepted',
								},
							],
						},
					],
				},
			});

			if (existingMatch) {
				return res
					.status(400)
					.json({ error: 'One of the users already has an active match' });
			}
		}

		await match.update({ status });
		res.json(match);
	} catch (error) {
		console.error('Update match status error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
