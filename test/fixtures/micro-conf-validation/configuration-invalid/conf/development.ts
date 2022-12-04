import { Conf } from './index.models';

const conf: Partial<Conf> = {
	foo: 'string',
	bar: 'string' as any,
	baz: {
		qux: 1 as any,
	},
};

export default conf;
