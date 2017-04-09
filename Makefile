SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

dev-server:
	webpack-dev-server --hot

ts-check:
	tsc -p . -w --noEmit --pretty

test:
	jest

tdd:
	jest --watch

start:
	concurrently --raw 'make dev-server' 'make ts-check'

watch-lib:
	tsc --declaration --project . --watch --pretty --outDir ../js-framework-benchmark/cycle-my/src/lib

.PHONY: dev-server ts-check test tdd start
