import React, { Component } from 'react';
import { Grid, Button, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel, Collapse, Alert } from '@mui/material/';
import { Link } from 'react-router-dom';

export default class CreateRoomPage extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: this.props.votesToSkip,
            guestCanPause: this.props.guestCanPause,
            successMsg: "",
            errorMsg: "",
        }
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
    }

    handleVotesChange(e) {
        this.setState({
            votesToSkip: e.target.value,
        });
    }

    handleGuestCanPauseChange(e) {
        this.setState({
            guestCanPause: e.target.value === 'true' ? true: false,
        })
    }

    handleRoomButtonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guest_can_pause: this.state.guestCanPause,
                votes_to_skip: this.state.votesToSkip,
            }),
        };
        fetch('/api/create-room', requestOptions)
        .then((response) => response.json())
        .then((data) => this.props.history('/room/' + data.code));
    }

    renderCreateButtons() {
        return(
            <>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant='outlined' onClick={this.handleRoomButtonPressed}>Create A Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant='outlined' to="/" component={Link}>Back</Button>
                </Grid>
            </>
        );
    }

    handleUpdateButtonPressed() {
        const requestOptions = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guest_can_pause: this.state.guestCanPause,
                votes_to_skip: this.state.votesToSkip,
                code: this.props.roomCode
            }),
        };
        fetch('/api/update-room', requestOptions)
        .then((response) => {
            if(response.ok) {
                this.setState({
                    successMsg: "Room updated successfully."
                });
            } else {
                this.setState({
                    errorMsg: "Error updating room..."
                });
            }
            this.props.updateCallback();
        });
    }

    renderUpdateButtons() {
        return (
            <Grid item xs={12} align="center">
                <Button color="primary" variant='outlined' onClick={this.handleUpdateButtonPressed}>Update Room</Button>
            </Grid>
        );
    }

    render() {
        const title = this.props.update ? "Update Room" : "Create a room";

        return ( 
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <Collapse in={this.state.successMsg != "" || this.state.errorMsg != ""}>
                        {this.state.successMsg != "" ? (
                            <Alert severity='success' onClose={() => {this.setState({ successMsg: "" })}} >{this.state.successMsg}</Alert>
                        ) : (
                            <Alert severity="error" onClose={() => {this.setState({ errorMsg: "" })}} >{this.state.errorMsg}</Alert>
                        )}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component='fieldset'>
                        <FormHelperText className="centerText">
                                Guest Control of playback state
                        </FormHelperText>
                        <RadioGroup row defaultValue={this.state.guestCanPause.toString() ? this.state.guestCanPause.toString() : " "} onChange={this.handleGuestCanPauseChange}>
                            <FormControlLabel value='true' control={<Radio color="primary"/>} label="Play/Pause" labelPlacement='bottom' />
                            <FormControlLabel value='false' control={<Radio color="secondary"/>} label="No Control" labelPlacement='bottom'/>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField required={true} type="number" defaultValue={this.state.votesToSkip} inputProps={{min: 1, style: {textAlign: "center"}}} onChange={this.handleVotesChange}/>
                        <FormHelperText className="centerText">
                            Votes Required To Skip Song
                        </FormHelperText>
                    </FormControl>
                </Grid>
               {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons() }
            </Grid>
        );
    }
}