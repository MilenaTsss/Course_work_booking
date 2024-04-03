import React, {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router-dom';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#ff0080',
        },
        secondary: {
            main: '#cc0066',
        },
        error: {
            main: '#ff0000',
        },
        background: {
            default: '#fff',
        },
    },
    typography: {
        fontSize: 14,
    },
});

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^[a-zA-Z0-9`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]{6,}$/;

export default function LoginPage() {
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateInput = (input, regex, emptyErrorMsg, formatErrorMsg) => {
        if (!input) {
            return {isValid: false, error: emptyErrorMsg};
        } else if (!regex.test(input)) {
            return {isValid: false, error: formatErrorMsg};
        } else {
            return {isValid: true, error: ''};
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        const emailValidation = validateInput(
            email,
            emailRegex,
            'Email is required',
            'Email format is invalid'
        );

        const passwordValidation = validateInput(
            password,
            passwordRegex,
            'Password is required',
            'Password must be at least 6 characters long and can only contain letters, numbers, and special characters.'
        );

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
                        Sign in
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
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            helperText={passwordError}  // Displaying the error on the screen
                            error={!!passwordError}  // Setting error prop to true if there is an error, false otherwise
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary"/>}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Sign In
                        </Button>
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item>
                                <Link component={RouterLink} to="/register">
                                    {"Don't have an account? Register"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}