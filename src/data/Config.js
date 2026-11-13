import axios from "axios";

let expiryTimer;
let loggingOut = false;
const startSubmitFeedback = config => {
	if (typeof document === "undefined" || !["post", "put", "patch"].includes(String(config.method).toLowerCase())) return config;
	const active = document.activeElement;
	const form = active?.closest?.("form") || document.querySelector('[role="dialog"] form');
	const button = active?.tagName === "BUTTON" ? active : form?.querySelector('button[type="submit"], button:not([type])');
	if (!button || button.dataset.requestLoading === "true") return config;
	button.dataset.requestLoading = "true";
	button.setAttribute("aria-busy", "true");
	button.disabled = true;
	const spinner = document.createElement("span");
	spinner.className = "request-button-spinner";
	spinner.setAttribute("aria-hidden", "true");
	button.prepend(spinner);
	config.__submitButton = button;
	return config;
};

const stopSubmitFeedback = config => {
	const button = config?.__submitButton;
	if (!button) return;
	button.querySelector(".request-button-spinner")?.remove();
	button.removeAttribute("aria-busy");
	delete button.dataset.requestLoading;
	button.disabled = false;
};

const forceLogout = () => {
	if (loggingOut) return;
	loggingOut = true;
	window.clearTimeout(expiryTimer);
	delete axios.defaults.headers.common["Authorization"];
	try {
		localStorage.removeItem("DATA_TOKEN");
		localStorage.removeItem("EXAMPREP_LOGIN");
		localStorage.removeItem("token");
		localStorage.removeItem("persist:root");
	} catch (_) {}
	if (window.location.pathname !== "/") window.location.replace("/");
};

const scheduleExpiry = token => {
	window.clearTimeout(expiryTimer);
	if (!token) return;
	try {
		const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
		const remaining = Number(payload.exp) * 1000 - Date.now();
		if (!Number.isFinite(remaining) || remaining <= 0) forceLogout();
		else expiryTimer = window.setTimeout(forceLogout, remaining);
	} catch (_) { forceLogout(); }
};

axios.interceptors.request.use(config => startSubmitFeedback(config));

axios.interceptors.response.use(
	response => { stopSubmitFeedback(response.config); return response; },
	error => {
		stopSubmitFeedback(error?.config);
		if (error?.response?.status === 401 && localStorage.getItem("DATA_TOKEN")) forceLogout();
		return Promise.reject(error);
	}
);

export const SetAuthToken = token => {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		axios.defaults.headers.common["frontend-source"] = "webuser";
		scheduleExpiry(token);
	} else {
		window.clearTimeout(expiryTimer);
		delete axios.defaults.headers.common["Authorization"];
		delete axios.defaults.headers.common["frontend-source"];
	}
};

// export const useURL = process.env.REACT_APP_BASE_URL;
export const useURL =
	(process.env.REACT_APP_BASE_URL || "https://cedugames-backend.onrender.com").replace(/\/+$/, "");

export const useURL2 =
	(process.env.REACT_APP_SUPPORT_BASE_URL || useURL).replace(/\/+$/, "");

export const useURL3 =
	(process.env.REACT_APP_SUPPORT_BASE_URL_TWO || useURL).replace(/\/+$/, "");

export const useURL4 =
	(process.env.REACT_APP_SUPPORT_BASE_URL_THREE || useURL).replace(/\/+$/, "");

export const SetDefaultHeaders = () => {
	axios.defaults.baseURL = useURL;
	axios.defaults.timeout = 30000;
	axios.defaults.headers.common["frontend-source"] = "webuser";
};
