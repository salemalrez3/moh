import api from "../config/api";

export async function register (newUser){
const res = await api.post('/register',newUser)
return res.data
}

export async function login(loginInfo) {
    const res = await api.post('/login',loginInfo)
    localStorage.setItem("token", res.data.token);
    return res.data;
}
