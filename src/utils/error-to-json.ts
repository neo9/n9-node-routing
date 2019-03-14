
(Error.prototype as any).toJSON = function(): any {
	return {
		message: this.message,
		...this,
	};
};
