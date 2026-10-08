export interface UserData {
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

export function generateUser(): UserData {

    // Generate a short unique username.
    // ParaBank has a limitation on username length.
    const uniqueId =
        Math.random()
            .toString(36)
            .substring(2, 8);

    return {
        firstName: 'Tushar',
        lastName: 'Bhanarkar',
        address: '123 Main St',
        city: 'Nagpur',
        state: 'MH',
        zipCode: '440001',
        phoneNumber: '9876543210',
        ssn: '12345',

        // Short username
        username: `qa${uniqueId}`,

        password: 'Password123'
    };
}