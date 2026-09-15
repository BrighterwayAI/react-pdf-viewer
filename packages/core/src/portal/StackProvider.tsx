/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2024 Nguyen Huu Phuoc <me@phuoc.ng>
 */

'use client';

import * as React from 'react';
import { StackContext } from './StackContext';

// Owns the counter that `Stack` increments for each portal it mounts.
// `useClickOutsideStack` and `useEscapeStack` only react on the topmost stack,
// which they detect by comparing their `currentIndex` with `numStacks`.
// Without a stateful provider above them the default context is used, whose
// counter never moves, so a portal opened outside of it can never be closed.
export const StackProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [numStacks, setNumStacks] = React.useState(0);
    const increaseNumStacks = () => setNumStacks((v) => v + 1);
    const decreaseNumStacks = () => setNumStacks((v) => v - 1);

    return (
        <StackContext.Provider value={{ currentIndex: 0, increaseNumStacks, decreaseNumStacks, numStacks }}>
            {children}
        </StackContext.Provider>
    );
};
