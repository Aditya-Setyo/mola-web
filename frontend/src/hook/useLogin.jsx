import { useMutation } from "@tanstack/react-query";

import Api from "../../services/api";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await Api.post("/api/v1/login", data);
      return response.data;
    },
  });
};

