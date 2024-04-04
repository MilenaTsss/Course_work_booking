import React, {useState, useEffect} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import Cookies from "js-cookie";

import {
    AppBar,
    Toolbar,
    IconButton,
    Button,
    TextField,
    Box,
    Container,
    Grid,
    Typography,
    CssBaseline,
    FormLabel,
    Link,
    Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {validatePassword} from "./utils/Validation";


export default function CustomerProfilePage() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState(null);

    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const getUserInfo = () => {
        console.log(Cookies.get('token'))
        const requestOptions = {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        };
        console.log(requestOptions)

        fetch("/api/profile/", requestOptions)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    setSuccess(null);
                    setError('Что-то пошло не так');
                } else {
                    setUser(data)
                    setEmail(data.email)
                    setFirstName(data.first_name)
                    setLastName(data.last_name)
                    setSuccess(null);
                    setError(null);
                }
                return data;
            })
            .catch((error) => {
                console.error('Error:', error);
                setSuccess(null);
                setError('Что-то пошло не так');
            });
    }

    const handleLogout = () => {
        Cookies.remove('token');
        navigate("/login");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        // Update password here...
    };

    const handleChangeUserInfo = (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "PATCH",
            headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
            }),
        };

        fetch("/api/profile/", requestOptions)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    setSuccess(null);
                    setError('Что-то пошло не так');
                } else {
                    setUser(data)
                    setSuccess('Данные успешно обновлены')
                    setError(null);
                }
                return data;
            })
            .catch((error) => {
                console.error('Error:', error);
                setSuccess(null);
                setError('Что-то пошло не так.');
            });
    }

    useEffect(() => {
        getUserInfo()
    }, []);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
                <AppBar position="static">
                    <Toolbar>
                        <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                            Профиль
                        </Typography>
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Box component="form" onSubmit={handleChangeUserInfo} noValidate sx={{mt: 1}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="firstName"
                                label="Имя"
                                name="firstName"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="lastName"
                                label="Фамилия"
                                name="lastName"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={user ? user.email : ''}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        Сохранить изменения
                    </Button>
                </Box>

                {/*<Typography variant="h2">Past Bookings</Typography>*/}
                {/*<Select value={booking} onChange={event => setBooking(event.target.value)} fullWidth>*/}
                {/*    /!* add list of bookings here *!/*/}
                {/*</Select><br/>*/}

                {/*<FormLabel>Rating:</FormLabel>*/}
                {/*<TextField type="number" value={rating} onChange={event => setRating(event.target.value)}*/}
                {/*           fullWidth/><br/>*/}
                {/*<Button variant="contained" onClick={leaveRating}>Submit Rating</Button><br/>*/}

                {/*<FormLabel>Review:</FormLabel>*/}
                {/*<TextField multiline maxRows={4} value={review} onChange={event => setReview(event.target.value)}*/}
                {/*           fullWidth/><br/>*/}
                {/*<Button variant="contained" onClick={leaveReview}>Leave a Review</Button><br/>*/}
                {error && (
                    <Alert severity="error" sx={{mt: 5, width: '100%', textAlign: 'center'}}>{error}</Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{mt: 5, width: '100%', textAlign: 'center'}}>{success}</Alert>
                )}
            </Box>
        </Container>
    );
}