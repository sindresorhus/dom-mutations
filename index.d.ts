export type Options = MutationObserverInit & {signal?: AbortSignal};

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
export default function domMutations(target: Node, options?: Options): AsyncIterable<MutationRecord>;

/**
Similar to `domMutations()`, but yields batches of [`MutationRecord`](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) objects, each batch representing a group of mutations captured together. This method is less convenient, but can be useful in some cases when you need to handle mutations together as a group.

@example
```
import {batchedDomMutations} from 'dom-mutations';

const target = document.querySelector('#unicorn');

for await (const mutations of batchedDomMutations(target, {childList: true})) {
	console.log('Batch of mutations:', mutations);
}
```
*/
export function batchedDomMutations(target: Node, options?: Options): AsyncIterable<MutationRecord[]>;
