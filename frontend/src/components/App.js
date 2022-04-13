import React, { Component } from 'react';
import { render } from 'react-dom';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

import HomePage from './HomePage';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const darkTheme = createTheme({
            palette: {
              mode: 'dark',
            },
        });
        return (
            <div className='center'>
                <ThemeProvider theme={darkTheme}>
                    <HomePage />
                </ThemeProvider>
            </div>
        );
    }
}

const appDiv = document.getElementById("root");
render(<App />, appDiv);