import { Page, Locator } from '@playwright/test';

export class TransferPage {
    readonly page: Page;

    readonly transferLink: Locator;
    readonly amount: Locator;
    readonly fromAccount: Locator;
    readonly toAccount: Locator;
    readonly transferButton: Locator;
    readonly transferResult: Locator;

    constructor(page: Page) {
        this.page = page;

        this.transferLink = page.getByRole(
            'link',
            { name: 'Transfer Funds' }
        );

        this.amount = page.locator('#amount');

        this.fromAccount = page.locator('#fromAccountId');

        this.toAccount = page.locator('#toAccountId');

        this.transferButton = page.getByRole(
            'button',
            { name: 'Transfer' }
        );

        this.transferResult =
            page.locator('#transferForm');
    }

    async openTransferPage() {
        console.log('');
        console.log(
            'Opening Transfer Funds page...'
        );

        await this.transferLink.click();

        await this.page.waitForLoadState(
            'domcontentloaded'
        );

        console.log(
            'Transfer page opened:',
            this.page.url()
        );
    }

    async transferFunds(
        amount: string,
        fromAccountId: string,
        toAccountId: string
    ) {
        console.log('');
        console.log(
            `Transferring $${amount}`
        );

        console.log(
            'From Account:',
            fromAccountId
        );

        console.log(
            'To Account:',
            toAccountId
        );

        await this.amount.fill(amount);

        await this.fromAccount.selectOption(
            fromAccountId
        );

        await this.toAccount.selectOption(
            toAccountId
        );

        console.log(
            'Clicking Transfer...'
        );

        await this.transferButton.click();

        const transferComplete =
            this.page.getByText(
                'Transfer Complete!',
                {
                    exact: true
                }
            );

        await transferComplete.waitFor({
            state: 'visible',
            timeout: 10000
        });

        console.log(
            'Transfer completed successfully.'
        );
    }

    async getTransferResultText(): Promise<string> {
        const bodyText =
            await this.page.locator('body').innerText();

        return bodyText;
    }
}