import { useMutation,useQuery ,useQueryClient } from "@tanstack/react-query";
import { register,login } from "../services/user";

export function useRegister (){
     const qc = useQueryClient();
     return useMutation({
       mutationFn: (newUser) => register(newUser),
       onSuccess: () => {
        //  qc.invalidateQueries({ queryKey: ["surveys"] });
       },
     });
}
export function useLogin (){
     const qc = useQueryClient();
     return useMutation({
       mutationFn: (userInfo) => login(userInfo),
       onSuccess: () => {
        //  qc.invalidateQueries({ queryKey: ["surveys"] });
       },
     });
}