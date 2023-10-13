module.exports = {
	parserPreset: {
		parserOpts: {
			headerPattern: /^([^:]*): ([a-zA-Z0-9-_' .]*)$/,
			headerCorrespondence: ['scope', 'subject'],
		},
	},
	rules: {
		'scope-empty': [2, 'never'],
		'scope-case': [2, 'always', 'kebab-case'],
		'scope-max-length': [2, 'always', 12],
		'scope-min-length': [2, 'always', 2],
		'subject-empty': [2, 'never'],
		'subject-case': [2, 'always', ['sentence-case']],
		'subject-full-stop': [2, 'never', '.'],
		'subject-min-length': [2, 'always', 5],
		'subject-max-length': [2, 'always', 100],
	},
};
