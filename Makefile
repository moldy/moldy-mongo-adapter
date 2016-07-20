build:
	@npm install
	@./node_modules/.bin/gulp

clean:
	@rm -rf node_modules dist .tmp

test:
	@MONGO_CONNECTION_STRING=mongodb://localhost:27017/test-moldy mocha test/readme.js

release:
	@make clean
	@make build

.PHONY: build clean release test