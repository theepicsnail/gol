all: node_modules
	node node_modules/requirejs/bin/r.js -o baseUrl=. name=gol out=gol.min.js
node_modules:
	npm install

