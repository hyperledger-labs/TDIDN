import authenticatedInstance from "../../AxiosInstance/authenticated";
import instance from "../../AxiosInstance/unAuthenticated";
import { toast } from 'sonner'

export const handleSignIn = async ({ email, password }) => {
  try {
    const { data, status } = await instance.post("/login", {
      email: email,
      password: password,
    });
    if (status === 200) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("email", data.email);
      localStorage.setItem("name", data.name);
      toast.success("Logged in successfully!")
      return true;
    }
  } catch (error) {
    console.log(error, "Error in signin");
    toast.error("Something went wrong!")
    return false;
  }
};

export const handleSignUp = async ({ email, password, name }) => {
  try {
    const { data, status } = await instance.post("/register", {
      email: email,
      password: password,
      name: name,
    });
    if (status === 200) {
      toast.success("Signed up successfully!")
      return true;
    }
  } catch (error) {
    console.log(error, "Error in signup");
    toast.error("Something went wrong!")
    return false;
  }
};

export const getUserInfo = () => async (dispatch) => {
  try {
    const { data, status } = await authenticatedInstance.get("/user/get-user-info");
    if (status === 200) {
      dispatch({
        type: "SET_CONNECTED_PLATFORMS",
        payload: data.platforms
      })
      return true;
    }
  } catch (error) {
    console.log(error, "Error in signup");
    // toast.error("Something went wrong!")
    return false;
  }
};