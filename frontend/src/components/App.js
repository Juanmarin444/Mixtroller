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
        // const useStyles = styled((theme) => ({
        //     root: {
        //       "&::-webkit-scrollbar": {
        //         width: 7,
        //       },
        //       "&::-webkit-scrollbar-track": {
        //         boxShadow: `inset 0 0 6px rgba(0, 0, 0, 0.3)`,
        //       },
        //       "&::-webkit-scrollbar-thumb": {
        //         backgroundColor: "darkgrey",
        //         outline: `1px solid slategrey`,
        //       },
        //     },
        // }));

        // const classes = useStyles();
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