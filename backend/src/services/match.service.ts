import { Op } from 'sequelize';
import Match from '../models/Match';
import User from '../models/User';

export const createMatchService = async (user: any, body: any) => {
	const { user2_id } = body;
	const existingMatch = await Match.findOne({
		where: {
			[Op.or]: [
				{ user1_id: user.user_id, user2_id },
				{ user1_id: user2_id, user2_id: user.user_id },
			],
		},
	});
	if (existingMatch) {
		throw new Error('Match already exists');
	}
	return Match.create({ user1_id: user.user_id, user2_id, status: 'pending' });
};

export const getMatchesService = async (user: any) => {
	return Match.findAll({
		where: {
			[Op.or]: [{ user1_id: user.user_id }, { user2_id: user.user_id }],
		},
		include: [
			{ model: User, as: 'user1', attributes: ['email'] },
			{ model: User, as: 'user2', attributes: ['email'] },
		],
	});
};

export const updateMatchStatusService = async (
	match_id: string,
	status: string,
	user: any
) => {
	const match = await Match.findByPk(match_id);
	if (!match) {
		throw new Error('Match not found');
	}
	if (match.user1_id !== user.user_id && match.user2_id !== user.user_id) {
		throw new Error('Not authorized to update this match');
	}
	if (
		typeof status !== 'string' ||
		!['pending', 'accepted', 'rejected'].includes(status)
	) {
		throw new Error('Invalid status value');
	}
	match.status = status as 'pending' | 'accepted' | 'rejected';
	await match.save();
	return match;
};
