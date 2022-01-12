// eslint-disable-next-line func-names
(Error.prototype as any).toJSON = function (): any {
	return {
		name: this.name,
		message: this.message,
		stack: this.stack,
		...this,
	};
};
