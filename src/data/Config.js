import axios from "axios";

export const SetAuthToken = token => {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		axios.defaults.headers.common["frontend-source"] = "webuser";
	} else {
		delete axios.defaults.headers.common["Authorization"];
		delete axios.defaults.headers.common["frontend-source"];
	}
};

// export const useURL = process.env.REACT_APP_BASE_URL;
export const useURL =
	process.env.REACT_APP_BASE_URL || "https://cedugames-backend.onrender.com";

export const useURL2 =
	process.env.REACT_APP_SUPPORT_BASE_URL || "https://cedugames-backend.onrender.com";

export const useURL3 =
	process.env.REACT_APP_SUPPORT_BASE_URL_TWO || "https://cedugames-backend.onrender.com";

export const useURL4 =
	process.env.REACT_APP_SUPPORT_BASE_URL_THREE || "https://cedugames-backend.onrender.com";

export const SetDefaultHeaders = () => {
	axios.defaults.baseURL = useURL;
	axios.defaults.headers.common["frontend-source"] = "webuser";
};
