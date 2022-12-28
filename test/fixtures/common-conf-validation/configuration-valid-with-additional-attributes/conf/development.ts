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
	secretInvisible: 'secretPasswordInvisible',
	secretUri: 'mongodb://myDBReader:secretPassword@mongodb0.example.com:27017/?authSource=admin',
	secretUriNotAnURI:
		'mongodb://myDBReader:secretPasswordmongodb0.example.com:27017/?authSource=admin',
};

export default conf;
