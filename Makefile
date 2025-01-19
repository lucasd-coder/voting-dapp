.PHONY: test
test:
	cd anchor && anchor test --skip-local-validator --skip-deploy

.PHONY: sol-val
sol-val:
	solana-test-validator