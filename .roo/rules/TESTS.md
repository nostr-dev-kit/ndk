Tests Organization
==================

This document describes how tests and test utilities are organized.

1. Directory Structure
   - `<package-root>/test/`
     - `mocks/`   : Mock implementations and test doubles (e.g., `relay-mock.ts`, `event-generator.ts`).
     - `helpers/`: Test fixtures, factories, and utilities (e.g., `test-fixtures.ts`, `time.ts`).
     - `setup/`  : Test runner global setup files (e.g., `vitest.setup.ts`).
     - `index.ts`: Entry point that re-exports all mocks and helpers for easy import.
   - `<package-root>/src/`
     - Place unit tests alongside modules using the `.test.ts` suffix. Example:
       ```
       src/module/foo.ts
       src/module/foo.test.ts
       ```

2. Available Mocks and Fixtures
   - Mocks:
     - RelayMock
     - RelayPoolMock
     - EventGenerator
     - mockNutzap, mockProof
   - Fixtures & Generators:
     - TestFixture
     - TestEventFactory
     - UserGenerator (predefined users: alice, bob, carol, dave, eve)
     - SignerGenerator
   - Time Control:
     - TimeController, withTimeControl

3. Naming Conventions
   - Use deterministic test user names: `alice`, `bob`, `carol`, `dave`, `eve` when generating users or signers.
   - Test files: `<module>.test.ts` placed next to source files.

4. Importing Test Utilities
   - In test code, import from the test index:
     ```ts
     import {
       RelayMock,
       RelayPoolMock,
       EventGenerator,
       mockNutzap,
       TestFixture,
       UserGenerator,
       TimeController,
     } from './test';
     ```
