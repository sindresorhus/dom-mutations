export default function domMutations(target, {signal, ...options} = {}) {
	return {
		async * [Symbol.asyncIterator]() {
			signal?.throwIfAborted();

			let resolveMutations;
			let rejectMutations;

			const observer = new globalThis.MutationObserver(mutations => {
				resolveMutations?.(mutations);
			});

			observer.observe(target, options);

			signal?.addEventListener('abort', () => {
				rejectMutations?.(signal.reason);
				observer.disconnect();
			}, {once: true});

			try {
				while (true) {
					signal?.throwIfAborted();

					yield * await new Promise((resolve, reject) => { // eslint-disable-line no-await-in-loop
						resolveMutations = resolve;
						rejectMutations = reject;
					});
				}
			} finally {
				observer.disconnect();
			}
		},
	};
}
