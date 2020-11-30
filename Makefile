install:
	npm install -g npm
	npm install -g gulp-cli
	npm install -g tsc
	npm install -g typings
	npm install
	typings install

build: install
	gulp clean
	gulp build

release: install
	gulp clean
	gulp build:release

clean:
	rm -rf build
	rm -rf release
	rm -rf typings
	rm -rf node_modules
