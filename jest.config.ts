import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
  preset: 'ts-jest',
  testMatch: '<rootDir>/src/**/*.test.ts',
  moduleNameMapper: pathsToModuleNameMapper(
    { '@/*': ['./src/Module/*'] },
    { prefix: '<rootDir>/' }
  ) ?? {},
  moduleFileExtensions: ['ts', 'js', 'json'], 
};

export default config;
