import { test, expect } from '@playwright/test';
import { ParaBankApi } from '../api/ParaBankApi';

interface Transaction {
    id: number;
    accountId: number;
    type: string;
    date: string;
    amount: number;
    description: string;
}

test(
    'Scenario C - API transaction history validation',
    async ({ request }) => {

        const api = new ParaBankApi(request);

        console.log('');
        console.log('========================================');
        console.log('SCENARIO C - API TRANSACTION TEST');
        console.log('========================================');

        // =========================================================
        // 1. INITIALIZE DATABASE
        // =========================================================

        console.log('');
        console.log('Initializing ParaBank database...');

        const initializeResponse =
            await request.post(
                '/parabank/services/bank/initializeDB',
                {
                    timeout: 15000
                }
            );

        console.log(
            'Initialize DB status:',
            initializeResponse.status()
        );

        expect(
            initializeResponse.ok()
        ).toBeTruthy();

        // =========================================================
        // 2. LOGIN THROUGH API
        // =========================================================

        console.log('');
        console.log('Logging in through API...');

        const loginResponse =
            await request.get(
                '/parabank/services/bank/login/john/demo',
                {
                    timeout: 15000
                }
            );

        console.log(
            'Login response status:',
            loginResponse.status()
        );

        expect(
            loginResponse.ok()
        ).toBeTruthy();

        const customerXml =
            await loginResponse.text();

        console.log(
            'Login response XML:',
            customerXml
        );

        const customerIdMatch =
            customerXml.match(
                /<id>(\d+)<\/id>/
            );

        if (!customerIdMatch) {
            throw new Error(
                'Customer ID was not found in login XML response.'
            );
        }

        const customerId =
            Number(customerIdMatch[1]);

        console.log(
            'Customer ID:',
            customerId
        );

        expect(
            customerId
        ).toBeGreaterThan(0);

        // =========================================================
        // 3. GET CUSTOMER ACCOUNTS
        // =========================================================

        console.log('');
        console.log(
            'Getting customer accounts...'
        );

        const accounts =
            await api.getCustomerAccounts(
                customerId
            );

        expect(
            Array.isArray(accounts)
        ).toBeTruthy();

        expect(
            accounts.length
        ).toBeGreaterThan(0);

        const accountId =
            String(accounts[0].id);

        console.log(
            'Selected Account ID:',
            accountId
        );

        expect(
            accountId
        ).toMatch(/^\d+$/);

        // =========================================================
        // 4. GET ACCOUNT BEFORE DEPOSIT
        // =========================================================

        console.log('');
        console.log(
            'Reading account BEFORE deposit...'
        );

        const accountBefore =
            await api.getAccount(
                accountId
            );

        console.log(
            'Account BEFORE deposit:',
            JSON.stringify(
                accountBefore,
                null,
                2
            )
        );

        const balanceBefore =
            Number(
                accountBefore.balance
            );

        console.log(
            'Balance BEFORE deposit:',
            balanceBefore.toFixed(2)
        );

        expect(
            Number.isNaN(balanceBefore)
        ).toBeFalsy();

        // =========================================================
        // 5. DEPOSIT
        // =========================================================

        const depositAmount =
            100.00;

        console.log('');
        console.log(
            `Depositing $${depositAmount.toFixed(2)}...`
        );

        const depositResponse =
            await request.post(
                '/parabank/services/bank/deposit',
                {
                    params: {
                        accountId,
                        amount:
                            depositAmount.toFixed(2)
                    },
                    timeout: 15000
                }
            );

        console.log(
            'Deposit response status:',
            depositResponse.status()
        );

        const depositBody =
            await depositResponse.text();

        console.log(
            'Deposit response:',
            depositBody
        );

        expect(
            depositResponse.ok()
        ).toBeTruthy();

        // =========================================================
        // 6. GET ACCOUNT AFTER DEPOSIT
        // =========================================================

        console.log('');
        console.log(
            'Reading account AFTER deposit...'
        );

        const accountAfter =
            await api.getAccount(
                accountId
            );

        console.log(
            'Account AFTER deposit:',
            JSON.stringify(
                accountAfter,
                null,
                2
            )
        );

        const balanceAfter =
            Number(
                accountAfter.balance
            );

        console.log(
            'Balance AFTER deposit:',
            balanceAfter.toFixed(2)
        );

        expect(
            Number.isNaN(balanceAfter)
        ).toBeFalsy();

        // =========================================================
        // 7. ENVIRONMENT VALIDATION
        // =========================================================

        const expectedBalanceAfter =
            balanceBefore +
            depositAmount;

        console.log('');
        console.log(
            'Expected balance AFTER deposit:',
            expectedBalanceAfter.toFixed(2)
        );

        console.log(
            'Actual balance AFTER deposit:',
            balanceAfter.toFixed(2)
        );

        // ---------------------------------------------------------
        // Environment limitation detection
        // ---------------------------------------------------------

        if (
            Math.abs(
                balanceAfter -
                expectedBalanceAfter
            ) > 0.005
        ) {

            const limitationMessage = [
                'SCENARIO C BLOCKED BY TEST ENVIRONMENT',
                '',
                'The deposit endpoint returned HTTP 200 and',
                'reported a successful deposit, but the account',
                'balance did not change after the deposit.',
                '',
                `Account ID: ${accountId}`,
                `Balance before deposit: $${balanceBefore.toFixed(2)}`,
                `Deposit requested: $${depositAmount.toFixed(2)}`,
                `Expected balance: $${expectedBalanceAfter.toFixed(2)}`,
                `Actual balance: $${balanceAfter.toFixed(2)}`,
                '',
                'Because the deposit was not persisted, the',
                'transaction-history validation cannot be performed',
                'reliably in the supplied ParaBank environment.',
                '',
                'This is an environment/API limitation, not a',
                'transaction schema assertion failure.'
            ].join('\n');

            console.error('');
            console.error(
                '========================================'
            );

            console.error(
                limitationMessage
            );

            console.error(
                '========================================'
            );

            // Keep the test FAILED.
            // We intentionally do not mark this as passed.

            throw new Error(
                limitationMessage
            );
        }

        // =========================================================
        // 8. GET TRANSACTION HISTORY
        // =========================================================

        console.log('');
        console.log(
            'Querying transaction history...'
        );

        const transactions =
            await api.getAccountTransactions(
                accountId
            );

        console.log('');
        console.log(
            'Transaction count:',
            transactions.length
        );

        console.log(
            'Transactions:',
            JSON.stringify(
                transactions,
                null,
                2
            )
        );

        // =========================================================
        // 9. VALIDATE TRANSACTION ARRAY
        // =========================================================

        expect(
            Array.isArray(transactions)
        ).toBeTruthy();

        expect(
            transactions.length
        ).toBeGreaterThan(0);

        // =========================================================
        // 10. FIND DEPOSIT TRANSACTION
        // =========================================================

        const depositTransaction =
            transactions.find(
                (transaction: Transaction) =>
                    transaction.accountId === Number(accountId) &&
                    transaction.type === 'Credit' &&
                    transaction.amount === depositAmount &&
                    transaction.description === 'Deposit via Web Service'
            );

        expect(
            depositTransaction
        ).toBeTruthy();

        const transaction =
            depositTransaction as Transaction;

        // =========================================================
        // 11. VALIDATE TRANSACTION SCHEMA
        // =========================================================

        expect(
            transaction
        ).toHaveProperty('id');

        expect(
            transaction
        ).toHaveProperty('accountId');

        expect(
            transaction
        ).toHaveProperty('type');

        expect(
            transaction
        ).toHaveProperty('date');

        expect(
            transaction
        ).toHaveProperty('amount');

        expect(
            transaction
        ).toHaveProperty('description');

        expect(
            typeof transaction.id
        ).toBe('number');

        expect(
            typeof transaction.accountId
        ).toBe('number');

        expect(
            typeof transaction.type
        ).toBe('string');

        expect(
            typeof transaction.date
        ).toBe('string');

        expect(
            typeof transaction.amount
        ).toBe('number');

        expect(
            typeof transaction.description
        ).toBe('string');

        // =========================================================
        // 12. VALIDATE TRANSACTION VALUES
        // =========================================================

        expect(
            transaction.accountId
        ).toBe(
            Number(accountId)
        );

        expect(
            transaction.amount
        ).toBe(
            depositAmount
        );

        expect(
            transaction.type
        ).toBe(
            'Credit'
        );

        expect(
            transaction.description
        ).toBe(
            'Deposit via Web Service'
        );

        // =========================================================
        // 13. SUCCESS
        // =========================================================

        console.log('');
        console.log(
            '========================================'
        );

        console.log(
            'SCENARIO C PASSED'
        );

        console.log(
            '========================================'
        );

        console.log(
            'Customer ID:',
            customerId
        );

        console.log(
            'Account ID:',
            accountId
        );

        console.log(
            `Deposit Amount: $${depositAmount.toFixed(2)}`
        );

        console.log(
            `Balance Before: $${balanceBefore.toFixed(2)}`
        );

        console.log(
            `Balance After: $${balanceAfter.toFixed(2)}`
        );

        console.log(
            'Validated Transaction:',
            JSON.stringify(
                transaction,
                null,
                2
            )
        );

        console.log(
            '========================================'
        );
    }
);