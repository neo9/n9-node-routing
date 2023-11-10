import { TransformationType, TransformFnParams } from 'class-transformer';
import * as _ from 'lodash';
import * as URIjs from 'uri-js';

export enum SecretType {
	/**
	 * Secret is not exposed at all, set to undefined
	 */
	INVISIBLE = 'invisible',

	/**
	 * Secret is replaced with *** if not nil
	 */
	OPAQUE = 'opaque',

	/**
	 * If secret is an URI, then the password only is hidden
	 */
	URI = 'uri',
}

export interface SecretTransformerOptions {
	each: boolean;
}

const defaultConfiguration: SecretTransformerOptions = {
	each: false,
};

export class SecretTransformer {
	private static uriRegex: RegExp =
		/^(?<scheme>[a-z][a-z0-9+.-]+):(?<authority>\/\/(?<user>[^@]+@)?(?<host>[a-z0-9.\-_~]+)(?<port>:\d+)?)?(?<path>(?:[a-z0-9-._~]|%[a-f0-9]|[!$&'()*+,;=:@])+(?:\/(?:[a-z0-9-._~]|%[a-f0-9]|[!$&'()*+,;=:@])*)*|(?:\/(?:[a-z0-9-._~]|%[a-f0-9]|[!$&'()*+,;=:@])+)*)?(?<query>\?(?:[a-z0-9-._~]|%[a-f0-9]|[!$&'()*+,;=:@]|[/?])+)?(?<fragment>#(?:[a-z0-9-._~]|%[a-f0-9]|[!$&'()*+,;=:@]|[/?])+)?$/i;

	public static GET_TRANSFORMER(
		secretType: SecretType = SecretType.INVISIBLE,
		options: SecretTransformerOptions = defaultConfiguration,
	): (params: TransformFnParams) => unknown {
		return ({ value, type }: TransformFnParams) => {
			switch (type) {
				case TransformationType.PLAIN_TO_CLASS:
				case TransformationType.CLASS_TO_CLASS:
					return value;
				case TransformationType.CLASS_TO_PLAIN:
					switch (secretType) {
						case SecretType.OPAQUE:
							return SecretTransformer.opaqueTransformation(value, options);
						case SecretType.URI:
							return SecretTransformer.uriTransformation(value, options);
						case SecretType.INVISIBLE:
						default:
							return;
					}
				default:
					throw new Error(`unknown-transformation-type : ${type}`);
			}
		};
	}

	private static opaqueTransformation(value: any, options: SecretTransformerOptions): unknown {
		if (options.each) {
			return _.map(value, (val) => SecretTransformer.makeOpaque(val));
		}
		return SecretTransformer.makeOpaque(value);
	}

	private static makeOpaque(value: any): unknown {
		return _.isNil(value) ? undefined : '********';
	}

	private static uriTransformation(value: any, options: SecretTransformerOptions): unknown {
		if (options.each) {
			return _.map(value, (val) => SecretTransformer.maskUri(val));
		}
		return SecretTransformer.maskUri(value);
	}

	private static maskUri(value: string): string {
		if (_.isString(value) && this.uriRegex.test(value)) {
			const uri = URIjs.parse(value);
			if (uri.userinfo) {
				const [user, password] = uri.userinfo.split(':');
				if (password) uri.userinfo = `${user}:********`;
			}
			return URIjs.serialize(uri);
		}
		return '##INVALID-URI##';
	}
}
