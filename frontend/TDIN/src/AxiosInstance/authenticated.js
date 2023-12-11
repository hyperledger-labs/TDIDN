import axios from "axios";

const instance = axios.create({
    baseURL:  process.env.REACT_APP_BASE_URL
});

//request interceptor to add the auth token header to requests
instance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        const accessHeader = `Bearer ${accessToken}`;
        if (accessToken) {
            config.headers["Authorization"] = accessHeader
            return config;
        }
        else {
            return Promise.reject("No token found");
        }
    },
    (error) => {
        Promise.reject(error);
    }
);

//response interceptor to refresh token on receiving token expired error
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;
        let refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken && (error.response.status === 500 || error.response.status === 504) && !originalRequest.err_retry) {
            originalRequest.err_retry = true;
            // retry the request using instance
            return instance(originalRequest);
        }
        if (
            refreshToken &&
            error.response.status === 401 &&
            (!originalRequest._retry || originalRequest._retry === undefined)
        ) {
            originalRequest._retry = true;
            return axios
                .post(process.env.REACT_APP_BASE_URL+ `/user/refresh-token`, {
                    refreshToken: refreshToken,
                })
                .then((res) => {
                    if (res.status === 200) {
                        localStorage.setItem("accessToken", res.data.accessToken);
                        // localStorage.setItem("refreshToken", res.data.refresh);
                        return instance(originalRequest);
                    }
                })
                .catch((err) => {
                    localStorage.clear();
                    // const navigate = useNavigate();
                    window.location.href = "/signin";
                    return Promise.reject(error);
                });
        }
        return Promise.reject(error);
    }
);

export default instance;