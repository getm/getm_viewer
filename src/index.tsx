/**
 * Entry point into the application.
 * This will mount our React application onto the HTML element with the ID 'app'.
 */
import './styles.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Polyfills
import 'array-find-polyfill';
import 'whatwg-fetch';
import * as promisepoly from 'es6-promise';

import { ThemedApp } from 'src/modules/root-app';
import { ThemeProvider } from 'react-themable-hoc';
import initStyles from 'src/shared/theme';

promisepoly.polyfill();
main();

function main() {
    // Initialize the theme system
    initStyles();

    ReactDOM.render(
        <ThemeProvider theme={"darkTheme"}>
            <ThemedApp classNames={{theme: 'darkTheme', workflowContainer: 'darkTheme'}}></ThemedApp>
        </ThemeProvider>,
        document.getElementById('app')
    );
}