import * as React from 'react';
import { createColClasses } from "src/shared/types/Column";

export interface LegendProps {
    color: string;
    dashed: boolean;
}

export const Legend: React.SFC<LegendProps> = (props: LegendProps) => {
    const { color, dashed } = props;

    return (
        dashed ? (
            <svg  width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3 H 24 V 24 H 3 Z" fill="transparent" stroke="rgba(0, 0, 0, 1)" strokeWidth="5"/>
                <path d="M3 3 H 24 V 24 H 3 Z" fill="transparent" stroke="rgba(255, 255, 255, 1)" strokeWidth="3"/>
                <path d="M3 3 H 24 V 24 H 3 Z" fill="transparent" stroke={color} strokeDasharray="10,10" strokeWidth="3"/>
            </svg>
        ) : (
            <svg  width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3 H 24 V 24 H 3 Z" fill="transparent" stroke={color} strokeWidth="2"/>
            </svg>
        )
    );
};