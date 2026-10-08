import { Page, Locator } from '@playwright/test';

export class AccountsPage {
    readonly page: Page;

    readonly openNewAccountLink: Locator;
    readonly accountType: Locator;
    readonly fromAccount: Locator;
    readonly openNewAccountButton: Locator;
    readonly newAccountId: Locator;

    constructor(page: Page) {
        this.page = page;

        this.openNewAccountLink = page.getByRole(
            'link',
            { name: 'Open New Account' }
        );

        this.accountType = page.locator('#type');

        this.fromAccount = page.locator(
            '#fromAccountId'
        );

        // ParaBank uses the button name rather than
        // the value attribute we originally expected.
        this.openNewAccountButton = page.getByRole(
            'button',
            { name: 'Open New Account' }
        );

        this.newAccountId = page.locator(
            '#newAccountId'
        );
    }

    async openNewAccount() {
        console.log('Opening New Account page...');

        await this.openNewAccountLink.click();

        await this.page.waitForLoadState(
            'domcontentloaded'
        );

        console.log(
            'New Account page opened:',
            this.page.url()
        );
    }

    async createCheckingAccount(): Promise<string> {

        console.log(
            'Selecting CHECKING account type...'
        );

        await this.accountType.selectOption({
            label: 'CHECKING'
        });

        console.log(
            'Selecting existing account...'
        );

        // Select the first available account.
        // No account ID is hard-coded.
        await this.fromAccount.selectOption({
            index: 0
        });

        const sourceAccountId =
            await this.fromAccount.inputValue();

        console.log(
            'Source Account ID:',
            sourceAccountId
        );

        console.log(
            'Clicking Open New Account...'
        );

        await this.openNewAccountButton.click();

        await this.newAccountId.waitFor({
            state: 'visible'
        });

        const newAccountId =
            (await this.newAccountId.textContent())?.trim();

        if (!newAccountId) {
            throw new Error(
                'New account ID was not generated.'
            );
        }

        console.log(
            'New Checking Account ID:',
            newAccountId
        );

        return newAccountId;
    }
}