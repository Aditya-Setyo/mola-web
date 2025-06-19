import { useMutation } from "@tanstack/react-query";

import Api from "../../services/api";

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await Api.post("/api/v1/register", data);
      return response.data;
    },
  });
};
