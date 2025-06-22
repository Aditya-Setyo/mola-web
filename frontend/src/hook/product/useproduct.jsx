import { useMutation } from "@tanstack/react-query";

// import service API
import Api from "../../services/api";

const product = {
    ID: uuid.UUID,
    Name: string ,
    Stock: int,
    weight: float64,
    Price: float64,
    Description: string,
    ImageURL: string,
    CategoryID: uint,
    CategoryName: string,
    HasVariant: bool,
    ColorID: uint,
    ColorName: string,
    SizeID: uint,
    SizeName: string,
};

export const useProduct = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await Api.get("/api/v1/product", data);
      return response.data;
    },
  });
};
