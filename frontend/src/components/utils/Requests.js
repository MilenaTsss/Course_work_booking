import Cookies from "js-cookie";
import {ADMIN_USER_TYPE, CUSTOMER_USER_TYPE} from "./Constants";

export const login = async (email, password, navigate, setError) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password}),
    };

    try {
        const response = await fetch("/api/login/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            setError('Неправильная почта или пароль');
        } else if (!response.ok) {
            setError('Что-то пошло не так');
        } else {
            const token = data.token;
            Cookies.set('token', token, {expires: 7, secure: true});

            const user = await getUser(setError);
            console.log(user.user_type)

            if (user.user_type !== ADMIN_USER_TYPE && user.user_type !== CUSTOMER_USER_TYPE) {
                setError('Что-то пошло не так');
            } else {
                setError(null);

                if (user.user_type === ADMIN_USER_TYPE) {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const register = async (email, password, firstName, lastName, companyName, userType, navigate, setError) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            user_type: userType
        }),
    };

    try {
        const response = await fetch("/api/register/", requestOptions);
        const data = await response.json();

        if (response.status === 409) {
            setError('Это электронная почта уже существует');
        } else if (!response.ok) {
            setError('Что-то пошло не так');
        } else {
            if (userType === ADMIN_USER_TYPE) {
                navigate('/admin');
            } else if (userType === CUSTOMER_USER_TYPE) {
                navigate('/profile');
            } else {
                setError('Что-то пошло не так');
            }
        }

        const token = data.token;
        Cookies.set('token', token, {expires: 7, secure: true});
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const getUser = async (setError) => {
    console.log(Cookies.get('token')) // TODO: remove
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/profile/", requestOptions);

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        const data = await response.json();
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const updateUser = async (firstName, lastName, companyName, setUser, setError, setSuccess) => {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
        }),
    };

    try {
        const response = await fetch("/api/profile/", requestOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setUser(data)
        setSuccess('Данные успешно обновлены')
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
}
