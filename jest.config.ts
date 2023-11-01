import type {JestConfigWithTsJest} from 'ts-jest'

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest', {
                tsconfig: 'tsconfig.debug.json'
            }
        ]
    },
    testMatch: ['**/__test__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    testTimeout: 30000,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    modulePathIgnorePatterns: ['<rootDir>/lib/'],
    coveragePathIgnorePatterns: ['<rootDir>/lib/']
} as JestConfigWithTsJest;
