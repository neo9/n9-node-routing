
(Error.prototype as any).toJSON = function(): any {
	return {
		name: this.name,
		message: this.message,
		...this,
	};
};
