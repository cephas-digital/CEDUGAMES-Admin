/* eslint-disable no-undef */
import { createElement, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Import useAuthStore hook from the correct location
import useAuthStore from "./data/Stores/Authstore";

const PageRender = () => {
  // Retrieve page, id, and step from URL params
  const { page, id, step } = useParams();
  const escape2 = [
    "institutionPage",
    "instructorPage",
    "about",
    "our-team",
    "contact-us",
    "sign-up",
    "leaderboard-details",
    "manage-user",
    "add-question",
    "edit-question",
    "upload-files",
    "edit-age-group",
    "add-age-group",
    "age-categories",
    "add-level",
    "view-categories",
    "level-questions",
    "edit-categories",
    "new-notification",
    "view-notification",
  ];
  const navigate = useNavigate();

  // Use the useAuthStore hook to access authentication-related state
  const { auth, errors, clearErrors, isAuth } = useAuthStore();

  // Define generatePage function inside PageRender
  const generatePage = (pageName, folder) => {
    const component = () => require(`./${folder}/${pageName}`).default;
    try {
      return createElement(component());
    } catch (error) {
      console.error("Error loading page:", error); // Log the error for debugging
      // Display an error message or redirect to an error page
      // You can return an ErrorPage component here if needed
      return null;
    }
  };

  useEffect(() => {
    // Redirect to the homepage if the user is not authenticated
    if (auth?.isAuth) {
      if (errors?.errorText) {
        if (page !== "login" && page !== "register") {
          navigate("/");
        }
        clearErrors();
      }
    }
    // Redirect to the homepage if the user is authenticated and tries to access login or register pages
    if (auth?.isAuth) {
      if (page === "login" || page === "register") {
        navigate("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, auth?.isAuth, navigate, errors?.errorText]);

  // Construct the page name based on URL params and available escape routes
  let pageName = "";
  if (step) {
    pageName = `${page}/${id}/${"[id]"}`;
  } else if (id) {
    if (
      (page === "home" && escape2.includes(id)) ||
      (page === "dashboard" && escape2.includes(id)) ||
      (page === "leaderboard" && escape2.includes(id)) ||
      (page === "user-management" && escape2.includes(id)) ||
      (page === "content" && escape2.includes(id)) ||
      (page === "coin-system" && escape2.includes(id)) ||
      (page === "categories" && escape2.includes(id)) ||
      (page === "notifications" && escape2.includes(id))
    ) {
      pageName = `${page}/${id}`;
    } else {
      pageName = `${page}/${"[id]"}`;
    }
  } else {
    pageName = `${page}`;
  }
  console.log({ isAuth });

  // Call generatePage with the constructed pageName and determine the folder based on user authentication status
  return generatePage(
    pageName,
    isAuth || page !== "login" ? "pages" : "screens"
  );
};

export default PageRender;

// /* eslint-disable no-undef */
// import { createElement, useEffect } from "react";
// import { useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import useAuthStore from "./data/Stores/Authstore";

// const generatePage = (pageName, folder) => {
//   const component = () => require(`./${folder}/${pageName}`).default;
//   try {
//     return createElement(component());
//   } catch (error) {
//     // return <ErrorPage />;
//   }
// };

// const PageRender = () => {
//   const { page, id, step } = useParams();
//   const escape2 = ["home", "about"],
//     navigate = useNavigate();

//   useEffect(() => {
//     if (!auth?.isAuth) {
//       if (errors?.errorText) {
//         if (page !== "login" && page !== "register") {
//           navigate("/");
//         }
//         clearErrors();
//       }
//     }
//     if (auth?.isAuth) {
//       if (page === "login" || page === "register") {
//         navigate("/");
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, auth?.isAuth, navigate, errors?.errorText]);

//   // if (general?.isLoading && users.isLoading) return <Loader />;

//   let pageName = "";
//   if (step) {
//     pageName = `${page}/${id}/${"[id]"}`;
//   } else if (id) {
//     if (
//       (page === "home" && escape2.includes(id)) ||
//       (page === "about" && escape2.includes(id))
//     ) {
//       pageName = `${page}/${id}`;
//     } else {
//       pageName = `${page}/${"[id]"}`;
//     }
//   } else {
//     pageName = `${page}`;
//   }
//   return generatePage(pageName, isAuth ? "pages" : "screens");
// };

// export default PageRender;
