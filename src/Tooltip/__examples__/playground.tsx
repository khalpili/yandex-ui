import React, { useState, useRef } from 'react';
import { select, boolean, number } from '@storybook/addon-knobs';
import { Tooltip, Direction } from '@yandex-lego/components/Tooltip/desktop/bundle';
import { Button } from '@yandex-lego/components/Button/desktop/bundle';

const DIRECTIONS: Direction[] = [
    'top-left',
    'top-center',
    'top-right',
    'right-top',
    'right-center',
    'right-bottom',
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'left-bottom',
    'left-center',
    'left-top',
];

export const Playground = () => {
    const scopeRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [visible, setVisible] = useState(false);

    const size = select('size', ['s', 'm', 'l'], 'm') as any;
    const state = select('state', ['', 'warning', 'alert', 'success'], '') as any;
    const direction = select('direction', DIRECTIONS, 'right-center') as any;
    const hasTail = boolean('hasTail', true);
    const mainOffset = number('mainOffset', 0);
    const secondaryOffset = number('secondaryOffset', 0);
    const tailOffset = number('tailOffset', 0);

    return (
        <div
            ref={scopeRef}
            style={{ position: 'relative', backgroundColor: 'var(--color-bg-default)' }}
        >
            <Button innerRef={buttonRef} view="default" size="m" onClick={() => setVisible(!visible)}>
                Target
            </Button>
            <Tooltip
                key={direction}
                hasTail={hasTail}
                mainOffset={mainOffset}
                secondaryOffset={secondaryOffset}
                tailOffset={tailOffset}
                direction={direction}
                anchor={buttonRef}
                scope={scopeRef}
                visible={visible}
                view="default"
                size={size}
                state={state}
            >
                Добавить в избранное
            </Tooltip>
        </div>
    );
};