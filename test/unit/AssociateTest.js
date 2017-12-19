'use strict';
let Associate = require('../../lib/Associate')();
let assert = require('assert');
let {
	User,
	Team,
	Game
} = require('./bootstrap');

Associate.impl(User, [Team], {
	associationType: function () {
		return 'oneToMany';
	},
	foreignKey: function () {
		return {
			col: 'team_id',
			val: 'teamId'
		};
	}
});

Associate.impl(Team, [User], {
	associationType: function () {
		return 'manyToOne';
	},
	foreignKey: function () {
		return {
			col: 'team_id',
			val: 'teamId'
		};
	}
});

Associate.impl(Team, [Game], {
	associationType: function () {
		return 'manyToMany';
	},

	foreignKey: function () {
		return {
			col: 'team_id',
			val: 'teamId'
		};
	},
	otherKey: function () {
		return {
			col: 'game_id',
			val: 'gameId'
		};
	},
	joinTable: function () {
		return 'game_teams';
	}
});

let t = new Team({ teamId: 1, name: 'Crushinators' });
let u = new User({ id: 1, name: 'John', teamId: 10 });

assert(u._getSql(Team) === 'SELECT teams.team_id, teams.name FROM teams WHERE (team_id = 10)', 'oneToMany get failed');
assert(t._getSql(User) === 'SELECT users.user_id, users.team_id, users.name FROM users WHERE (team_id = 1)', 'manyToOne get failed');
assert(t._getSql(Game) === 'SELECT games.game_id, games.date FROM games INNER JOIN game_teams ON (games.game_id = game_teams.game_id) WHERE (team_id=1)', `manyToMany get failed: ${t._getSql(Game)}`);

assert(u._addSql(new Team({ teamId: 3 })) === 'UPDATE users SET team_id = 3 WHERE (user_id = 1)', 'oneToMany add failed');
assert(t._addSql(new User({ id: 5 })) === 'UPDATE users SET team_id = 1 WHERE (user_id = 5)', 'manyToOne add failed');
assert(t._addSql(new Game({ gameId: 10 })) === 'INSERT INTO game_teams (team_id, game_id) VALUES (1, 10)', `manyToMany add failed: ${t._addSql(new Game({ gameId: 10 }))}`);
