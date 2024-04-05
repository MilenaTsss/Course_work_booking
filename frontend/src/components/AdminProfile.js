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
import {getUser, updateUser} from "./utils/Requests";

export default function AdminProfilePage() {
    const [user, setUser] = useState(null);
    const [companyName, setCompanyName] = useState('')

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