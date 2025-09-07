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
		[Symbol.asyncIterator]() {
			signal?.throwIfAborted();

			const resolvers = [];
			let isDone = false;

			const observer = new globalThis.MutationObserver(mutations => {
				resolvers.shift()?.resolve({value: mutations, done: false});
			});

			observer.observe(target, options);

			const cleanup = () => {
				isDone = true;
				observer.disconnect();
			};

			signal?.addEventListener('abort', () => {
				cleanup();

				for (const {reject} of resolvers.splice(0)) {
					reject(signal.reason);
				}
			}, {once: true});

			return {
				async next() {
					if (isDone) {
						return {value: undefined, done: true};
					}

					signal?.throwIfAborted();

					return new Promise((resolve, reject) => {
						resolvers.push({resolve, reject});
					});
				},
				async return(value) {
					cleanup();

					for (const {resolve} of resolvers.splice(0)) {
						resolve({value: undefined, done: true});
					}

					return {value, done: true};
				},
				async throw(error) {
					await this.return();
					throw error;
				},
				[Symbol.asyncIterator]() {
					return this;
				},
			};
		},
	};
}
