import React, {Component} from "react";
import {TextField, Button, Typography, Box, Container} from "@material-ui/core"

export default class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
        };
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };


    render() {
        return (
            <Container maxWidth="sm" style={{
                backgroundColor: '#fff',
                marginTop: '50px',
                padding: '50px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                <Typography variant="h4" style={{marginBottom: '20px', textAlign: 'center'}}>Регистрация</Typography>
                <form noValidate autoComplete="off">
                    <TextField
                        name="email"
                        required={true}
                        label="Email"
                        type={"email"}
                        value={this.state.email}
                        onChange={this.handleChange}
                        fullWidth margin="normal"
                    />
                    <TextField
                        name="firstname"
                        required={true}
                        label="Имя"
                        value={this.state.password}
                        onChange={this.handleChange}
                        fullWidth margin="normal"
                    />
                    <TextField
                        name="password"
                        required={true}
                        label="Пароль"
                        type="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        fullWidth margin="normal"
                    />
                    <Box mt={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            type="submit"
                            fullWidth>
                            Зарегистрироваться
                        </Button>
                    </Box>
                    <Box mt={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => window.location.href = 'login.html'}
                            fullWidth>
                            Войти
                        </Button>
                    </Box>
                </form>
            </Container>
        );
    }
}