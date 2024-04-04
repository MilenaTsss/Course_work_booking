import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
    Avatar,
    Button,
    TextField,
    Box,
    Container,
    Grid,
    Typography,
    CssBaseline,
    ThemeProvider,
    Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import {defaultTheme} from "./AppTheme";
import {validateEmail, validatePassword} from "./Validation"

export default function LoginPage() {
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password);
        setEmailError(emailValidation.error);
        setPasswordError(passwordValidation.error);

        if (emailValidation.isValid && passwordValidation.isValid) {
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: email, password: password}),
            };

            fetch("/api/login/", requestOptions)
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Вход в аккаунт
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            helperText={emailError}  // Displaying the error on the screen
                            error={!!emailError}  // Setting error prop to true if there is an error, false otherwise
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            name="password"
                            label="Пароль"
                            type="password"
                            autoComplete="current-password"
                            helperText={passwordError}  // Displaying the error on the screen
                            error={!!passwordError}  // Setting error prop to true if there is an error, false otherwise
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Войти
                        </Button>
                    </Box>
                    <Grid container justifyContent="center" alignItems="center">
                        <Grid item>
                            <Link component={RouterLink} to="/register">
                                {"Ещё нет аккаунта? Зарегистрироваться"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    );
}