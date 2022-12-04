import { Conf } from './index.models';

const conf: Partial<Conf> & any = {
	foo: 'string',
	bar: 2,
	baz: {
		qux: 'string',
	},
	whitelist1: 'string',
	whitelist2: 'string',
};

export default conf;
