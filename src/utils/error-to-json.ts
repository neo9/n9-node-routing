
(Error.prototype as any).toJSON = function(): Error {
	return {
		message: this.message,
		...this,
	};
};
