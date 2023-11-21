export default function domMutations(target, options) {
	return {
		async * [Symbol.asyncIterator]() {
			let resolveMutations;

			const observer = new globalThis.MutationObserver(mutations => {
				resolveMutations?.(mutations);
			});

			observer.observe(target, options);

			try {
				while (true) {
					yield * await new Promise(resolve => { // eslint-disable-line no-await-in-loop
						resolveMutations = resolve;
					});
				}
			} finally {
				observer.disconnect();
			}
		},
	};
}
