import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsPage } from '../pages/AccountsPage';
import { LoanPage } from '../pages/LoanPage';
import { generateUser } from '../utils/testData';
import { ParaBankApi } from '../api/ParaBankApi';


test(
    'Scenario A - register new ParaBank user and apply for loan',
    async ({ page, request }) => {

        /*
         * =========================================================
         * API PRECONDITION
         * =========================================================
         */

        const api =
            new ParaBankApi(request);

        console.log('');
        console.log(
            'Cleaning ParaBank database...'
        );

        await api.cleanDatabase();

        console.log(
            'Setting Loan Provider to Web Service...'
        );

        await api.setParameter(
            'loanProvider',
            'Web Service'
        );


        /*
         * =========================================================
         * REGISTER USER
         * =========================================================
         */

        await page.goto('/');

        console.log(
            'Opened ParaBank:',
            page.url()
        );

        const loginPage =
            new LoginPage(page);

        await loginPage.openRegistration();

        console.log(
            'Registration page:',
            page.url()
        );

        const user =
            generateUser();

        console.log('');
        console.log(
            'Generated username:',
            user.username
        );

        const registerPage =
            new RegisterPage(page);

        await registerPage.register(user);

        const registrationSuccessful =
            await registerPage.isRegistrationSuccessful();

        console.log('');
        console.log(
            'Registration successful:',
            registrationSuccessful
        );

        expect(
            registrationSuccessful
        ).toBeTruthy();


        /*
         * =========================================================
         * CREATE CHECKING ACCOUNT
         * =========================================================
         */

        const accountsPage =
            new AccountsPage(page);

        await accountsPage.openNewAccount();

        await expect(
            accountsPage.accountType
        ).toBeVisible();

        await expect(
            accountsPage.fromAccount
        ).toBeVisible();

        console.log('');
        console.log(
            'Creating new CHECKING account...'
        );

        const newAccountId =
            await accountsPage.createCheckingAccount();

        console.log('');
        console.log(
            'Created Checking Account ID:',
            newAccountId
        );

        expect(
            newAccountId
        ).toBeTruthy();

        expect(
            newAccountId
        ).toMatch(/^\d+$/);

        console.log(
            'Checking account created successfully.'
        );


        /*
         * =========================================================
         * APPLY FOR LOAN
         * =========================================================
         */

        const loanPage =
            new LoanPage(page);

        await loanPage.openRequestLoan();

        console.log(
            'Request Loan page opened successfully.'
        );

        await expect(
            loanPage.loanAmount
        ).toBeVisible();

        await expect(
            loanPage.downPayment
        ).toBeVisible();

        await expect(
            loanPage.fromAccount
        ).toBeVisible();


        const loanAmount =
            '1000';

        const downPayment =
            '100';


        console.log('');
        console.log(
            'Applying for loan...'
        );

        console.log(
            'Loan Amount:',
            loanAmount
        );

        console.log(
            'Down Payment:',
            downPayment
        );

        console.log(
            'Loan Source Account:',
            newAccountId
        );


        await loanPage.applyForLoan(
            loanAmount,
            downPayment,
            newAccountId
        );


        /*
         * =========================================================
         * VALIDATE LOAN STATUS
         * =========================================================
         */

        const loanStatus =
            await loanPage.getLoanStatus();

        console.log('');
        console.log(
            'Loan Status:',
            loanStatus
        );

        expect(
            loanStatus
        ).toBe('Approved');

        console.log(
            'Loan approved successfully.'
        );


        /*
         * =========================================================
         * EXTRACT DYNAMIC LOAN ACCOUNT NUMBER
         * =========================================================
         */

        const loanAccountNumber =
            await loanPage.getLoanAccountNumber();

        console.log('');
        console.log(
            'Loan Account Number:',
            loanAccountNumber
        );

        expect(
            loanAccountNumber
        ).toMatch(/^\d+$/
        );


        /*
         * =========================================================
         * UI VALIDATION
         *
         * Open the newly created loan account and validate
         * its balance directly from the UI.
         * =========================================================
         */

        await loanPage.openLoanAccount(
            loanAccountNumber
        );


        console.log('');
        console.log(
            'Validating loan account details...'
        );


        /*
         * Validate that we are actually on the account
         * details page.
         */

        await expect(
            page.locator('body')
        ).toContainText(
            loanAccountNumber
        );


        /*
         * Validate account type.
         */

        await expect(
            page.locator('body')
        ).toContainText(
            'LOAN'
        );


        /*
         * Get balance from UI.
         */

        const actualBalance =
            await loanPage.getLoanAccountBalance();


        console.log('');
        console.log(
            'Expected Loan Balance:',
            '$1000.00'
        );

        console.log(
            'Actual Loan Balance:',
            actualBalance
        );


        /*
         * Normalize currency.
         *
         * "$1000.00"
         * "$1,000.00"
         *
         * both become:
         *
         * "1000.00"
         */

        const normalizedBalance =
            actualBalance
                .replace('$', '')
                .replace(/,/g, '')
                .trim();


        const expectedBalance =
            Number(loanAmount).toFixed(2);


        console.log('');
        console.log(
            'Normalized Balance:',
            normalizedBalance
        );

        console.log(
            'Expected Balance:',
            expectedBalance
        );


        /*
         * FINAL ASSERTION
         */

        expect(
            normalizedBalance
        ).toBe(
            expectedBalance
        );


        console.log('');
        console.log(
            'Loan balance validated successfully through UI.'
        );

        console.log('');
        console.log(
            'Scenario A completed successfully.'
        );
    }
);