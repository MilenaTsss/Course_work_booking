import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {
    Box,
    Container,
    Typography,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Grid,
    TextField,
    Button,
    Alert,
} from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
import {getUser, updateUser} from "../user/Requests";
import {validateEmpty, validatePassword} from "../authorization/Validation";
import {changePassword} from "../authorization/Requests";

export default function AdminProfilePage() {
    const [user, setUser] = useState(null);
    const [companyName, setCompanyName] = useState('')

    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove('token');
        navigate("/login");
    };

    const handleChangeUserInfo = async (event) => {
        event.preventDefault();
        await updateUser('', '', companyName, setUser, setError, setSuccess)
    }

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const oldPassword = data.get('oldPassword');
        const newPassword = data.get('newPassword');

        const oldPasswordValidation = validateEmpty(oldPassword, 'Требуется ввести пароль');
        const newPasswordValidation = validatePassword(newPassword);
        setOldPasswordError(oldPasswordValidation.error);
        setNewPasswordError(newPasswordValidation.error);

        if (!oldPasswordValidation.isValid || !newPasswordValidation.isValid) {
            return;
        }

        await changePassword(oldPassword, newPassword, setError, setSuccess);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const fetchedUser = await getUser(setError)
                setUser(fetchedUser)
                setCompanyName(fetchedUser.company_name)
            } catch (e) {
                setError("Failed to fetch user data");
                console.error(e);
            }
        };

        fetchUser();
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
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="companyName"
                                label="Название компании"
                                name="companyName"
                                value={companyName}
                                onChange={(event) => setCompanyName(event.target.value)}
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

                <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{mt: 1}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                required
                                id="oldPassword"
                                label="Старый пароль"
                                name="oldPassword"
                                type="password"
                                autoComplete="current-password"
                                helperText={oldPasswordError}
                                error={!!oldPasswordError}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                required
                                id="newPassword"
                                label="Новый пароль"
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                helperText={newPasswordError}
                                error={!!newPasswordError}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        Сменить пароль
                    </Button>
                </Box>

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