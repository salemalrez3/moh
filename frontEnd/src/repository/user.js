import { useMutation } from "@tanstack/react-query";
import { register, login } from "../services/user";

export function useRegister() {
  return useMutation({
    mutationFn: (newUser) => register(newUser),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (userInfo) => login(userInfo),
  });
}