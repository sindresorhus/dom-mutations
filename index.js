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
	signal?.throwIfAborted();

	const resolvers = [];

	let isDone = false;

	const observer = new globalThis.MutationObserver(mutations => {
		const next = resolvers.shift();

		if (next) {
			next.resolve({value: mutations, done: false});
		}
	});

	observer.observe(target, options);

	signal?.addEventListener('abort', () => {
		isDone = true;
		while (resolvers.length > 0) {
			const next = resolvers.shift();
			next.reject(signal.reason);
		}

		observer.disconnect();
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
			isDone = true;

			observer.disconnect();

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
}
