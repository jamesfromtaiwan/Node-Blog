REPORTER = list
MOCHA_OPTS = --ui bdd -c

db:
	echo Seeding blog-test *****************************************************
	./db/seed.sh
test:
	clear

	echo Starting test *********************************************************
	TWITTER_CONSUMER_KEY=mV6ZNQc5H66Bku5S2032cdtxo \
	TWITTER_CONSUMER_SECRET=F2xXSCHsjSNtGwVl3tWSKp5NiscuzpGgkDbTP2NP8bm7Tw6x6g \
	./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
	$(MOCHA_OPTS) \
	tests/*.js
	echo Ending test
start:
	TWITTER_CONSUMER_KEY=mV6ZNQc5H66Bku5S2032cdtxo \
	TWITTER_CONSUMER_SECRET=F2xXSCHsjSNtGwVl3tWSKp5NiscuzpGgkDbTP2NP8bm7Tw6x6g \
	node  app

.PHONY: test db start