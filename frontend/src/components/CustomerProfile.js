import React from 'react';
import {
    Avatar,
    Box,
    Container,
    Typography,
    CssBaseline,
} from '@mui/material';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';

export default function CustomerProfilePage() {
    return (
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
                    <Person2OutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Профиль
                </Typography>
            </Box>
        </Container>
    );
}