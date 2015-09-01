
test:
	./node_modules/.bin/gulp test

.PHONY: test

setup_db:
	./scripts/setup_index.sh

.PHONY: setup_db

watch:
	./node_modules/.bin/gulp server:start server:restart

.PHONY: watch

livereload:
	./node_modules/.bin/gulp browser-sync

.PHONY: livereload

nodemon:
	./node_modules/.bin/gulp nodemon

.PHONY: nodemon

updateall:
	npm outdated --depth=0 | grep -v Package | awk '{print $$1}' | xargs -I% npm install --save %@latest 

.PHONY: updateall

