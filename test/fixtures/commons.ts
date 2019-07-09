export default {
	print: false,
	excludeSomeLogs: (line) => !line.includes(':nest:')
};
