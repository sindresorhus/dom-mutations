# dom-mutations

> Observe changes to the DOM using an async iterable — A nicer API for [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

Only works in the browser.

## Install

```sh
npm install dom-mutations
```

## Usage

```js
import domMutations from 'dom-mutations';

const target = document.querySelector('#unicorn');

for await (const mutation of domMutations(target, {childList: true})) {
	console.log('Mutation:', mutation);
}
```

## API

### domMutations(target, options?)

Accepts the same arguments as [`MutationObserver#observe()`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#parameters) with an additional optional [`signal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) option to abort the observation. If the signal is triggered, the async iterable throws an [abort error](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort).

Returns an [`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols) that yields [`MutationRecord`](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) objects representing individual mutations.

## FAQ

### How do I stop the iteration?

Simply `return` or `break` in the loop body.

### How do I stop the iteration from the outside?

**Triggering the iterator to return**

```js
import domMutations from 'dom-mutations';

const target = document.querySelector('#unicorn');

const mutationIterator = domMutations(target, {childList: true})[Symbol.asyncIterator]();

(async () => {
	for await (const mutation of mutationIterator) {
		console.log('Mutation:', mutation);
	}
})();

setTimeout(() => {
	mutationIterator.return();
}, 10000);
```

**Using a variable**

This has the downside of not ending the iteration until the next mutation.

```js
import domMutations from 'dom-mutations';

const target = document.querySelector('#unicorn');

let shouldStop = false;

(async () => {
	for await (const mutation of domMutations(target, {childList: true})) {
		if (shouldStop) {
			break;
		}

		console.log('Mutation:', mutation);
	}
})();

setTimeout(() => {
	shouldStop = true;
}, 10000);
```

**Using [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)**

Unlike the above approaches, this will make the iterable throw an [abort error](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort).

```js
import domMutations from 'dom-mutations';

const target = document.querySelector('#unicorn');
const controller = new AbortController();
const {signal} = controller;

(async () => {
	for await (const mutation of domMutations(target, {childList: true, signal})) {
		console.log('Mutation:', mutation);
	}
})();

setTimeout(() => {
	controller.abort();
}, 10000);
```

## Related

- [request-animation-frames](https://github.com/sindresorhus/request-animation-frames) - Use `requestAnimationFrame` as an async iterable, in any JavaScript environment
