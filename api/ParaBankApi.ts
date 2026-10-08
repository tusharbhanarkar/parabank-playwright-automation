import { APIRequestContext } from '@playwright/test';

export class ParaBankApi {
    readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    // =========================================================
    // CLEAN DATABASE
    // =========================================================

    async cleanDatabase() {
        console.log('Starting cleanDB API call...');

        const response =
            await this.request.post(
                '/parabankv2/services/bank/cleanDB',
                {
                    timeout: 15000
                }
            );

        console.log(
            'cleanDB response status:',
            response.status()
        );

        if (!response.ok()) {
            throw new Error(
                `Failed to clean ParaBank database. Status: ${response.status()}`
            );
        }

        console.log(
            'Database cleaned successfully.'
        );
    }

    // =========================================================
    // SET PARAMETER
    // =========================================================

    async setParameter(
        name: string,
        value: string
    ) {
        console.log(
            `Setting ParaBank parameter: ${name} = ${value}`
        );

        const response =
            await this.request.post(
                `/parabankv2/services/bank/setParameter/${encodeURIComponent(name)}/${encodeURIComponent(value)}`,
                {
                    timeout: 15000
                }
            );

        console.log(
            'setParameter response status:',
            response.status()
        );

        if (!response.ok()) {
            throw new Error(
                `Failed to set ParaBank parameter "${name}". Status: ${response.status()}`
            );
        }

        console.log(
            `Parameter "${name}" set successfully.`
        );
    }

    // =========================================================
    // GET ACCOUNT
    // =========================================================

    async getAccount(
        accountId: string
    ) {
        console.log(
            `Getting account details for account ID: ${accountId}`
        );

        const response =
            await this.request.get(
                `/parabank/services/bank/accounts/${encodeURIComponent(accountId)}`,
                {
                    timeout: 15000
                }
            );

        console.log(
            'Get account response status:',
            response.status()
        );

        if (!response.ok()) {
            const responseBody =
                await response.text();

            console.log(
                'Get account response body:',
                responseBody
            );

            throw new Error(
                `Failed to get account ${accountId}. Status: ${response.status()}`
            );
        }

        const accountXml =
            await response.text();

        console.log(
            'Account XML:',
            accountXml
        );

        const getValue =
            (tag: string): string => {

                const result =
                    accountXml.match(
                        new RegExp(
                            `<${tag}>([\\s\\S]*?)<\\/${tag}>`
                        )
                    );

                return result
                    ? result[1]
                    : '';
            };

        const account = {
            id: Number(
                getValue('id')
            ),

            customerId: Number(
                getValue('customerId')
            ),

            type:
                getValue('type'),

            balance: Number(
                getValue('balance')
            )
        };

        console.log(
            'Parsed account:',
            JSON.stringify(
                account,
                null,
                2
            )
        );

        if (
            Number.isNaN(account.id) ||
            Number.isNaN(account.customerId) ||
            Number.isNaN(account.balance)
        ) {
            throw new Error(
                `Unable to parse account XML: ${accountXml}`
            );
        }

        return account;
    }

    // =========================================================
    // GET ACCOUNT TRANSACTIONS
    // =========================================================

    async getAccountTransactions(
        accountId: string
    ) {
        console.log(
            `Getting transactions for account: ${accountId}`
        );

        const response =
            await this.request.get(
                `/parabank/services/bank/accounts/${encodeURIComponent(accountId)}/transactions`,
                {
                    timeout: 15000
                }
            );

        console.log(
            'Transactions API status:',
            response.status()
        );

        if (!response.ok()) {
            const responseBody =
                await response.text();

            console.log(
                'Transactions response body:',
                responseBody
            );

            throw new Error(
                `Failed to get transactions for account ${accountId}. Status: ${response.status()}`
            );
        }

        const transactionsXml =
            await response.text();

        console.log('');
        console.log(
            'Transactions XML:',
            transactionsXml
        );

        const transactionBlocks =
            [
                ...transactionsXml.matchAll(
                    /<transaction>([\s\S]*?)<\/transaction>/g
                )
            ];

        const transactions =
            transactionBlocks.map(
                match => {

                    const block =
                        match[1];

                    const getValue =
                        (tag: string): string => {

                            const result =
                                block.match(
                                    new RegExp(
                                        `<${tag}>([\\s\\S]*?)<\\/${tag}>`
                                    )
                                );

                            return result
                                ? result[1]
                                : '';
                        };

                    return {
                        id: Number(
                            getValue('id')
                        ),

                        accountId: Number(
                            getValue('accountId')
                        ),

                        type:
                            getValue('type'),

                        date:
                            getValue('date'),

                        amount: Number(
                            getValue('amount')
                        ),

                        description:
                            getValue('description')
                    };
                }
            );

        console.log('');
        console.log(
            'Parsed transactions:',
            JSON.stringify(
                transactions,
                null,
                2
            )
        );

        if (
            transactions.length === 0
        ) {
            console.log(
                'WARNING: Transaction API returned no transactions.'
            );
        }

        return transactions;
    }

    // =========================================================
    // CREATE CUSTOMER
    // =========================================================

    async createCustomer(
        user: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            phoneNumber: string;
            ssn: string;
            username: string;
            password: string;
        }
    ) {
        console.log('');
        console.log(
            `Creating API user: ${user.username}`
        );

        const response =
            await this.request.post(
                '/parabank/services/bank/customers',
                {
                    form: {
                        'customer.firstName':
                            user.firstName,

                        'customer.lastName':
                            user.lastName,

                        'customer.address.street':
                            user.address,

                        'customer.address.city':
                            user.city,

                        'customer.address.state':
                            user.state,

                        'customer.address.zipCode':
                            user.zipCode,

                        'customer.phoneNumber':
                            user.phoneNumber,

                        'customer.ssn':
                            user.ssn,

                        'customer.username':
                            user.username,

                        'customer.password':
                            user.password
                    },

                    timeout: 15000
                }
            );

        console.log(
            'Create customer response status:',
            response.status()
        );

        if (!response.ok()) {
            const responseBody =
                await response.text();

            console.log(
                'Create customer response body:',
                responseBody
            );

            throw new Error(
                `Failed to create API customer. Status: ${response.status()}`
            );
        }

        const customerBody =
            await response.text();

        console.log(
            'Created customer response:',
            customerBody
        );

        return customerBody;
    }

    // =========================================================
    // GET CUSTOMER ACCOUNTS
    // =========================================================

    async getCustomerAccounts(
        customerId: number
    ) {
        console.log('');
        console.log(
            `Getting accounts for customer: ${customerId}`
        );

        const response =
            await this.request.get(
                `/parabank/services/bank/customers/${customerId}/accounts`,
                {
                    timeout: 15000
                }
            );

        console.log(
            'Customer accounts response status:',
            response.status()
        );

        if (!response.ok()) {
            const responseBody =
                await response.text();

            console.log(
                'Customer accounts response body:',
                responseBody
            );

            throw new Error(
                `Failed to get customer accounts. Status: ${response.status()}`
            );
        }

        const accountsXml =
            await response.text();

        console.log(
            'Customer accounts XML:',
            accountsXml
        );

        const accountIds =
            [
                ...accountsXml.matchAll(
                    /<id>(\d+)<\/id>/g
                )
            ].map(
                match =>
                    Number(match[1])
            );

        console.log(
            'Account IDs:',
            accountIds
        );

        if (
            accountIds.length === 0
        ) {
            throw new Error(
                'No account IDs were found in customer accounts XML response.'
            );
        }

        return accountIds.map(
            id => ({
                id
            })
        );
    }

    // =========================================================
    // DEPOSIT
    // =========================================================

    async deposit(
        accountId: string,
        amount: number
    ) {
        console.log('');
        console.log(
            `Depositing $${amount.toFixed(2)} into account ${accountId}`
        );

        const response =
            await this.request.post(
                '/parabank/services/bank/deposit',
                {
                    form: {
                        accountId,
                        amount:
                            amount.toFixed(2)
                    },

                    timeout: 15000
                }
            );

        console.log(
            'Deposit response status:',
            response.status()
        );

        if (!response.ok()) {
            const responseBody =
                await response.text();

            console.log(
                'Deposit response body:',
                responseBody
            );

            throw new Error(
                `Failed to deposit funds. Status: ${response.status()}`
            );
        }

        const resultText =
            await response.text();

        console.log(
            'Deposit response:',
            resultText
        );

        return resultText;
    }
}