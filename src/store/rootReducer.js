import layout from "./layout";
import auth from "./api/auth/authSlice";
import notifications from "./notificationsSlice";

const rootReducer = {
  layout,
  auth,
  notifications,
};
export default rootReducer;
