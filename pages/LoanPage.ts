import { Page, Locator } from '@playwright/test';

export class LoanPage {
    readonly page: Page;

    readonly requestLoanLink: Locator;
    readonly loanAmount: Locator;
    readonly downPayment: Locator;
    readonly fromAccount: Locator;
    readonly applyButton: Locator;
    readonly loanStatus: Locator;

    constructor(page: Page) {
        this.page = page;

        this.requestLoanLink = page.getByRole(
            'link',
            { name: 'Request Loan' }
        );

        this.loanAmount = page.locator('#amount');

        this.downPayment = page.locator('#downPayment');

        this.fromAccount = page.locator('#fromAccountId');

        this.applyButton = page.getByRole(
            'button',
            { name: 'Apply Now' }
        );

        this.loanStatus = page.locator('#loanStatus');
    }

    async openRequestLoan() {
        console.log('Opening Request Loan page...');

        await this.requestLoanLink.click();

        await this.page.waitForLoadState(
            'domcontentloaded'
        );

        console.log(
            'Request Loan page opened:',
            this.page.url()
        );
    }

    async applyForLoan(
        amount: string,
        downPayment: string,
        fromAccountId: string
    ) {
        console.log(
            'Loan Amount:',
            amount
        );

        console.log(
            'Down Payment:',
            downPayment
        );

        console.log(
            'Using Account ID:',
            fromAccountId
        );

        await this.loanAmount.fill(amount);

        await this.downPayment.fill(downPayment);

        await this.fromAccount.selectOption(
            fromAccountId
        );

        console.log(
            'Submitting loan application...'
        );

        await this.applyButton.click();

        await this.loanStatus.waitFor({
            state: 'visible'
        });

        console.log(
            'Loan application submitted.'
        );
    }

    async getLoanStatus(): Promise<string> {
        const status =
            await this.loanStatus.textContent();

        return status?.trim() ?? '';
    }

    async getLoanAccountNumber(): Promise<string> {
        const pageText =
            await this.page.locator('body').innerText();

        console.log('');
        console.log(
            'Extracting loan account number...'
        );

        const match =
            pageText.match(
                /Your new account number:\s*(\d+)/
            );

        if (!match) {
            throw new Error(
                'New loan account number was not found.'
            );
        }

        const accountNumber =
            match[1];

        console.log(
            'Loan Account Number:',
            accountNumber
        );

        return accountNumber;
    }

    async openLoanAccount(
        loanAccountNumber: string
    ) {
        console.log('');
        console.log(
            'Opening loan account through UI...'
        );

        const accountLink =
            this.page.getByRole(
                'link',
                {
                    name: loanAccountNumber,
                    exact: true
                }
            );

        await accountLink.waitFor({
            state: 'visible'
        });

        await accountLink.click();

        await this.page.waitForLoadState(
            'domcontentloaded'
        );

        console.log(
            'Loan account page opened:',
            this.page.url()
        );
    }

    async getLoanAccountBalance(): Promise<string> {
        console.log('');
        console.log(
            'Reading loan account balance from UI...'
        );

        const balance =
            this.page.locator('#balance');

        await balance.waitFor({
            state: 'visible'
        });

        /*
         * Playwright will automatically wait for the
         * expected text to appear. No static sleep.
         */
        await balance.waitFor({
            state: 'attached'
        });

        const balanceText =
            await balance.textContent();

        console.log(
            'Loan account balance from UI:',
            balanceText
        );

        if (!balanceText?.trim()) {
            throw new Error(
                'Loan account balance is empty in the UI.'
            );
        }

        return balanceText.trim();
    }
}