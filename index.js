export default function domMutations(target, options = {}) {
	return {
		async * [Symbol.asyncIterator]() {
			for await (const mutations of batchedDomMutations(target, options)) {
				yield * mutations;
			}
		},
	};
}

export function batchedDomMutations(target, {signal, ...options} = {}) {
	return {
		async * [Symbol.asyncIterator]() {
			signal?.throwIfAborted();

			let resolveMutations = [];
			let rejectMutations = [];

			const observer = new globalThis.MutationObserver(mutations => {
				const resolve = resolveMutations.shift();
				resolve?.(mutations);
			});

			observer.observe(target, options);

			signal?.addEventListener('abort', () => {
				const reject = rejectMutations.shift();
				reject?.(signal.reason);

				observer.disconnect();
			}, {once: true});

			try {
				while (true) {
					signal?.throwIfAborted();

					yield await new Promise((resolve, reject) => { // eslint-disable-line no-await-in-loop
						resolveMutations.push(resolve);
						rejectMutations.push(reject);
					});
				}
			} finally {
				observer.disconnect();
			}
		},
	};
}
