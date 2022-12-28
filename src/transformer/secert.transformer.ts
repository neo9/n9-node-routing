import { TransformationType, TransformFnParams } from 'class-transformer';
import * as _ from 'lodash';

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

export class SecretTransformer {
	private static uriRegex: RegExp = /(?<=:)([^@:]+)(?=@[^@]+$)/;

	public static GET_TRANSFORMER(
		secretType: SecretType = SecretType.INVISIBLE,
	): (params: TransformFnParams) => any {
		return ({ value, type }: TransformFnParams) => {
			switch (type) {
				case TransformationType.PLAIN_TO_CLASS:
				case TransformationType.CLASS_TO_CLASS:
					return value;
				case TransformationType.CLASS_TO_PLAIN:
					switch (secretType) {
						case SecretType.OPAQUE:
							return _.isNil(value) ? undefined : '********';
						case SecretType.URI:
							if (_.isString(value) && this.uriRegex.test(value)) {
								return value.replace(this.uriRegex, '********');
							}
							return;
						case SecretType.INVISIBLE:
						default:
							return;
					}
				default:
					throw new Error(`unknown-transformation-type : ${type}`);
			}
		};
	}
}
