import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import DataProvider from "./data/Context";
import store from "./data/Store";
import { BrowserRouter as Router } from "react-router-dom";
import Routers from "./Routes";
import { SetAuthToken, SetDefaultHeaders } from "./data/Config";
import { TOKEN } from "./data/Reducers/UserReducer";
import { Provider } from "react-redux";
import { useEffect } from "react";

const removeInitialPreloader = () => {
  document.querySelectorAll(".lds-ellipsis,.preloader").forEach((element) => {
    element.remove();
  });
};

if (document.readyState === "complete") removeInitialPreloader();
else window.addEventListener("load", removeInitialPreloader, { once: true });

SetDefaultHeaders();

if (localStorage.getItem(TOKEN)) {
  SetAuthToken(localStorage.getItem(TOKEN));
}

const App = () => {
  useEffect(removeInitialPreloader, []);

  return (
    // <DataProvider>
    //   <Router>
    //     <Routers />
    //   </Router>
    // </DataProvider>

    <Provider store={store}>
      <DataProvider>
        <Router>
          <Routers />
        </Router>
      </DataProvider>
    </Provider>
  );
};

export default App;
