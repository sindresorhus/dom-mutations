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

Accepts the same arguments as [`MutationObserver#observe()`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#parameters).

Returns an [`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols) that yields [`MutationRecord`](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) objects representing individual mutations.

## FAQ

### How do I stop the loop?

Simply `return` or `break` in the loop.

### How do I stop the loop from the outside?

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

## Related

- [request-animation-frames](https://github.com/sindresorhus/request-animation-frames) - Use `requestAnimationFrame` as an async iterable, in any JavaScript environment
