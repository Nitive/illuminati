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

.PHONY: dev-server ts-check test tdd start
