import { Page, Locator } from '@playwright/test';
import { UserData } from '../utils/testData';

export class RegisterPage {
    readonly page: Page;

    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly address: Locator;
    readonly city: Locator;
    readonly state: Locator;
    readonly zipCode: Locator;
    readonly phoneNumber: Locator;
    readonly ssn: Locator;
    readonly username: Locator;
    readonly password: Locator;
    readonly confirmPassword: Locator;
    readonly registerButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.firstName = page.locator(
            'input[name="customer.firstName"]'
        );

        this.lastName = page.locator(
            'input[name="customer.lastName"]'
        );

        this.address = page.locator(
            'input[name="customer.address.street"]'
        );

        this.city = page.locator(
            'input[name="customer.address.city"]'
        );

        this.state = page.locator(
            'input[name="customer.address.state"]'
        );

        this.zipCode = page.locator(
            'input[name="customer.address.zipCode"]'
        );

        this.phoneNumber = page.locator(
            'input[name="customer.phoneNumber"]'
        );

        this.ssn = page.locator(
            'input[name="customer.ssn"]'
        );

        this.username = page.locator(
            'input[name="customer.username"]'
        );

        this.password = page.locator(
            'input[name="customer.password"]'
        );

        this.confirmPassword = page.locator(
            'input[name="repeatedPassword"]'
        );

        this.registerButton = page.locator(
            'input[type="submit"][value="Register"]'
        );
    }

    async register(user: UserData) {

        // 1. First Name
        console.log('1. Clicking First Name...');
        await this.firstName.click();
        await this.firstName.fill(user.firstName);

        // 2. Last Name
        console.log('2. Clicking Last Name...');
        await this.lastName.click();
        await this.lastName.fill(user.lastName);

        // 3. Address
        console.log('3. Clicking Address...');
        await this.address.click();
        await this.address.fill(user.address);

        // 4. City
        console.log('4. Clicking City...');
        await this.city.click();
        await this.city.fill(user.city);

        // 5. State
        console.log('5. Clicking State...');
        await this.state.click();
        await this.state.fill(user.state);

        // 6. Zip Code
        console.log('6. Clicking Zip Code...');
        await this.zipCode.click();
        await this.zipCode.fill(user.zipCode);

        // 7. Phone Number
        console.log('7. Clicking Phone Number...');
        await this.phoneNumber.click();
        await this.phoneNumber.fill(user.phoneNumber);

        // 8. SSN
        console.log('8. Clicking SSN...');
        await this.ssn.click();
        await this.ssn.fill(user.ssn);

        // 9. Username
        console.log('9. Clicking Username...');
        await this.username.click();
        await this.username.fill(user.username);

        // 10. Password
        console.log('10. Clicking Password...');
        await this.password.click();
        await this.password.fill(user.password);

        // 11. Confirm Password
        console.log('11. Clicking Confirm Password...');
        await this.confirmPassword.click();
        await this.confirmPassword.fill(user.password);

        console.log('');
        console.log('Username:', await this.username.inputValue());

        // -----------------------------------------
        // 12. SUBMIT REGISTRATION
        // -----------------------------------------

        console.log('12. Clicking Register...');

        await this.registerButton.click();

        // Wait for the page to settle after submission
        await this.page.waitForLoadState('domcontentloaded');

        console.log('');
        console.log('Registration submitted.');
        console.log('Registration URL:', this.page.url());

        console.log(
            'Registration page title:',
            await this.page.title()
        );
    }

    async isRegistrationSuccessful(): Promise<boolean> {

        const accountServices = this.page.getByText(
            'Accounts Overview'
        );

        return await accountServices.isVisible().catch(() => false);
    }
}