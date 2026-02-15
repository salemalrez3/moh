import api from "../config/api";

export async function register(newUser) {
  const res = await api.post('/auth/register', {
    email: newUser.email,
    password: newUser.password,
    name: newUser.name,
  });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
}

export async function login(loginInfo) {
  const res = await api.post('/auth/login', {
    email: loginInfo.email,
    password: loginInfo.password,
  });
  localStorage.setItem("token", res.data.token);
  return res.data;
}
