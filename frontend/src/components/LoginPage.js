import React, {Component} from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import {Link} from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {Collapse} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";


export default class LoginPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h3" variant="h3">
                        Авторизация
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField
                            variant="standard"
                            required
                            id="email"
                            label="Email"
                            name="email"
                        />
                        <TextField
                            variant="standard"
                            required
                            id="password"
                            label="Password"
                            name="password"
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.handleRoomButtonPressed}
                    >
                        Войти
                    </Button>
                </Grid>
            </Grid>
        );
    }
}