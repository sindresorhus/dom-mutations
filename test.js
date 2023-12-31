import test from 'ava';
import {JSDOM} from 'jsdom';
import domMutations, {batchedDomMutations} from './index.js';

const {window} = new JSDOM('');
const {document} = window;

globalThis.MutationObserver = window.MutationObserver;

test('captures mutations', async t => {
	document.body.innerHTML = '';

	const div = document.createElement('div');
	document.body.append(div);

	setTimeout(() => {
		div.setAttribute('test', 'value1');
	}, 100);

	setTimeout(() => {
		div.setAttribute('test', 'value2');
	}, 200);

	setTimeout(() => {
		div.setAttribute('test', 'value3');
	}, 300);

	let mutationCount = 0;
	for await (const mutation of domMutations(div, {attributes: true})) {
		t.is(mutation.type, 'attributes');
		t.is(mutation.attributeName, 'test');
		t.is(mutation.target, div);
		mutationCount++;

		if (mutationCount === 3) {
			break; // Exit loop after capturing the expected number of mutations
		}
	}

	t.is(mutationCount, 3, 'Three mutations should be observed');
});

test('stops observing after disconnection', async t => {
	document.body.innerHTML = '';

	const div = document.createElement('div');
	document.body.append(div);

	const mutationIterator = domMutations(div, {attributes: true})[Symbol.asyncIterator]();

	setTimeout(() => {
		div.setAttribute('test', 'value');
	}, 100);

	mutationIterator.return();

	let mutationObserved = false;

	// eslint-disable-next-line no-unreachable-loop, no-unused-vars
	for await (const mutation of mutationIterator) {
		mutationObserved = true;
		break;
	}

	t.false(mutationObserved, 'No mutations should be observed after disconnection');
});

test('handles abort signal', async t => {
	document.body.innerHTML = '';

	const div = document.createElement('div');
	document.body.append(div);

	const controller = new AbortController();
	const {signal} = controller;

	setTimeout(() => {
		div.setAttribute('test', 'value');
	}, 100);

	setTimeout(() => {
		controller.abort();
	}, 50);

	await t.throwsAsync(async () => {
		// eslint-disable-next-line no-unused-vars
		for await (const mutation of domMutations(div, {attributes: true, signal})) {
			t.fail();
		}
	}, {name: 'AbortError'});
});

test('captures mutation batches', async t => {
	document.body.innerHTML = '';

	const div = document.createElement('div');
	document.body.append(div);

	const div2 = document.createElement('div');
	document.body.append(div2);

	setTimeout(() => {
		div.setAttribute('test', 'value1');
		div2.setAttribute('test', 'value1');
		div.setAttribute('test', 'value2');
		div2.setAttribute('test', 'value2');
	}, 50);

	let batchCount = 0;
	for await (const mutations of batchedDomMutations(div, {attributes: true})) {
		t.true(Array.isArray(mutations));
		t.is(mutations.length, 2);

		if (++batchCount === 1) {
			break;
		}
	}
});
