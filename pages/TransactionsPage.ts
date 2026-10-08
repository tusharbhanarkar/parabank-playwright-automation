import { Page, Locator, expect } from '@playwright/test';

export class TransactionsPage {
    readonly page: Page;
    readonly accountsOverviewLink: Locator;
    readonly accountTable: Locator;

    constructor(page: Page) {
        this.page = page;

        this.accountsOverviewLink = page.getByRole(
            'link',
            { name: 'Accounts Overview' }
        );

        this.accountTable = page.locator('table').filter({
            hasText: 'Account'
        }).filter({
            hasText: 'Balance'
        }).filter({
            hasText: 'Available Amount'
        });
    }

    async openAccountsOverview() {
        console.log('');
        console.log('Opening Accounts Overview...');

        await this.accountsOverviewLink.click();

        await this.page.waitForLoadState('domcontentloaded');

        console.log(
            'Accounts Overview opened:',
            this.page.url()
        );
    }

    async getAccountBalance(accountId: string): Promise<number> {
        console.log('');
        console.log(
            'Reading balance for account:',
            accountId
        );

        const accountRow = this.accountTable.locator('tr').filter({
            hasText: accountId
        }).first();

        await expect(accountRow).toBeVisible();

        const cells = accountRow.locator('td');

        const cellCount = await cells.count();

        if (cellCount < 3) {
            throw new Error(
                `Could not read account row for ${accountId}.`
            );
        }

        const accountNumber =
            (await cells.nth(0).innerText()).trim();

        const balanceText =
            (await cells.nth(1).innerText()).trim();

        const availableText =
            (await cells.nth(2).innerText()).trim();

        console.log(
            'Account:',
            accountNumber
        );

        console.log(
            'Balance:',
            balanceText
        );

        console.log(
            'Available:',
            availableText
        );

        const balance =
            Number(
                balanceText
                    .replace('$', '')
                    .replace(/,/g, '')
                    .trim()
            );

        if (Number.isNaN(balance)) {
            throw new Error(
                `Unable to parse account balance: ${balanceText}`
            );
        }

        return balance;
    }
}