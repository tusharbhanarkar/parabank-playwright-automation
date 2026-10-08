import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransferPage } from '../pages/TransferPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { generateUser } from '../utils/testData';
import { ParaBankApi } from '../api/ParaBankApi';

test(
    'Scenario B - transfer funds and validate transaction history',
    async ({ page, request }) => {

        // --------------------------------------------------
        // 1. Clean ParaBank database
        // --------------------------------------------------

        const api = new ParaBankApi(request);

        await api.cleanDatabase();


        // --------------------------------------------------
        // 2. Register new user
        // --------------------------------------------------

        await page.goto('/');

        const loginPage = new LoginPage(page);

        await loginPage.openRegistration();

        const user = generateUser();

        console.log('Generated username:', user.username);

        const registerPage = new RegisterPage(page);

        await registerPage.register(user);

        const registrationSuccessful =
            await registerPage.isRegistrationSuccessful();

        expect(registrationSuccessful).toBeTruthy();


        // --------------------------------------------------
        // 3. Create first checking account
        // --------------------------------------------------

        const accountsPage = new AccountsPage(page);

        await accountsPage.openNewAccount();

        const firstAccountId =
            await accountsPage.createCheckingAccount();

        expect(firstAccountId).toMatch(/^\d+$/);

        console.log(
            'First Checking Account:',
            firstAccountId
        );


        // --------------------------------------------------
        // 4. Create second checking account
        // --------------------------------------------------

        await accountsPage.openNewAccount();

        const secondAccountId =
            await accountsPage.createCheckingAccount();

        expect(secondAccountId).toMatch(/^\d+$/);

        expect(secondAccountId).not.toBe(firstAccountId);

        console.log(
            'Second Checking Account:',
            secondAccountId
        );


        // --------------------------------------------------
        // 5. Open Accounts Overview and capture
        //    ACTUAL initial balance
        // --------------------------------------------------

        const transactionsPage =
            new TransactionsPage(page);

        await transactionsPage.openAccountsOverview();

        const initialBalance =
            await transactionsPage.getAccountBalance(
                firstAccountId
            );

        console.log(
            'Initial source account balance:',
            initialBalance.toFixed(2)
        );


        // --------------------------------------------------
        // 6. Perform first transfer
        // --------------------------------------------------

        const transferPage =
            new TransferPage(page);

        const firstTransferAmount = 150.00;

        console.log(
            'Performing first transfer...'
        );

        await transferPage.openTransferPage();

        await transferPage.transferFunds(
            firstTransferAmount.toFixed(2),
            firstAccountId,
            secondAccountId
        );

        console.log(
            'First transfer completed successfully.'
        );


        // --------------------------------------------------
        // 7. Perform second transfer
        // --------------------------------------------------

        const secondTransferAmount = 25.50;

        console.log(
            'Performing second transfer...'
        );

        await transferPage.openTransferPage();

        await transferPage.transferFunds(
            secondTransferAmount.toFixed(2),
            firstAccountId,
            secondAccountId
        );

        console.log(
            'Second transfer completed successfully.'
        );


        // --------------------------------------------------
        // 8. Perform third transfer
        // --------------------------------------------------

        const thirdTransferAmount = 8.99;

        console.log(
            'Performing third transfer...'
        );

        await transferPage.openTransferPage();

        await transferPage.transferFunds(
            thirdTransferAmount.toFixed(2),
            firstAccountId,
            secondAccountId
        );

        console.log(
            'Third transfer completed successfully.'
        );


        // --------------------------------------------------
        // 9. Calculate total transferred
        //    Using cents to avoid floating point issues
        // --------------------------------------------------

        const expectedDeductionCents =
            Math.round(firstTransferAmount * 100) +
            Math.round(secondTransferAmount * 100) +
            Math.round(thirdTransferAmount * 100);

        const expectedDeduction =
            expectedDeductionCents / 100;

        console.log(
            'Expected total transferred:',
            expectedDeduction.toFixed(2)
        );

        expect(expectedDeduction).toBe(184.49);


        // --------------------------------------------------
        // 10. Open Accounts Overview again
        // --------------------------------------------------

        await transactionsPage.openAccountsOverview();


        // --------------------------------------------------
        // 11. Read final balance
        // --------------------------------------------------

        const finalBalance =
            await transactionsPage.getAccountBalance(
                firstAccountId
            );

        console.log(
            'Final source account balance:',
            finalBalance.toFixed(2)
        );


        // --------------------------------------------------
        // 12. Calculate expected final balance
        //     using the REAL initial balance
        // --------------------------------------------------

        const initialBalanceCents =
            Math.round(initialBalance * 100);

        const expectedFinalBalanceCents =
            initialBalanceCents -
            expectedDeductionCents;

        const expectedFinalBalance =
            expectedFinalBalanceCents / 100;

        console.log(
            'Initial balance:',
            initialBalance.toFixed(2)
        );

        console.log(
            'Expected deduction:',
            expectedDeduction.toFixed(2)
        );

        console.log(
            'Expected final balance:',
            expectedFinalBalance.toFixed(2)
        );

        console.log(
            'Actual final balance:',
            finalBalance.toFixed(2)
        );


        // --------------------------------------------------
        // 13. Validate final balance
        // --------------------------------------------------

        expect(finalBalance).toBe(
            expectedFinalBalance
        );


        // --------------------------------------------------
        // 14. Scenario B completed
        // --------------------------------------------------

        console.log('');
        console.log(
            'Scenario B validation successful.'
        );

        console.log(
            `Initial balance: $${initialBalance.toFixed(2)}`
        );

        console.log(
            `Total transferred: $${expectedDeduction.toFixed(2)}`
        );

        console.log(
            `Final balance: $${finalBalance.toFixed(2)}`
        );
    }
);