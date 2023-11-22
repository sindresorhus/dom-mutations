/**
@returns An async iterable that yields [`MutationRecord`](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) objects representing individual mutations.

@example
```
import domMutations from 'dom-mutations';

const target = document.querySelector('#unicorn');

for await (const mutation of domMutations(target, {childList: true})) {
	console.log('Mutation:', mutation);
}
```
*/
export default function domMutations(target: Node, options?: MutationObserverInit & {signal?: AbortSignal}): AsyncIterable<MutationRecord>;
