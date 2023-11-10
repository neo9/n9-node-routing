import { Conf } from './index.models';

const conf: Partial<Conf> & any = {
	foo: 'string',
	bar: 2,
	baz: {
		qux: 'string',
	},
	whitelist1: 'string',
	whitelist2: 'string',

	secret: 'secretPassword',
	secretOpaque: 'secretPasswordHiddenButKnownIfNil',
	secretOpaqueArray: ['secretPasswordHiddenButKnownIfNil', 'secretPasswordHiddenButKnownIfNil2'],
	secretInvisible: 'secretPasswordInvisible',
	secretUri: 'mongodb://myDBReader:secretPassword@mongodb0.example.com:27017/?authSource=admin',
	secretUriArray: [
		'mongodb://myDBReader:secretPassword@mongodb0.example.com:27017/?authSource=admin',
		'mongodb://myDBReader:secretPassword@mongodb1.example.com:27017/?authSource=admin',
		'https://user@example.com',
	],
	secretUriWithoutPassword: 'mongodb://mongodb0.example.com:27017/?authSource=admin',
	secretUriWithoutPasswordArray: [
		'mongodb://mongodb0.example.com:27017/?authSource=admin',
		'mongodb://mongodb1.example.com:27017/?authSource=admin',
		'https://example.com',
	],
	secretUriNotAnURI:
		'mongodb://myDBReader:secretPassword"mongodb0.example.com:27017/?authSource=admin',
};

export default conf;
