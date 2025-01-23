import axios from "axios";
import { useNavigate } from "react-router-dom";
import handleAxiosError from "../../../utils/ErrorHandler";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const login = () => {
    axios
      .post("/api/users/login", { ...formValues })
      .then((response) => navigate("/home"))
      .catch(handleAxiosError);
  };

  return (
    <div className="border" style={{ width: "40%", padding: "40px" }}>
      <h3>Login</h3>
      <input
        className="form-control mb-2"
        type="text"
        placeholder="Enter your email"
        onChange={handleChange}
        name="email"
        value={formValues.email}
        required
      />
      <input
        className="form-control mb-2"
        type="password"
        placeholder="Enter your password"
        onChange={handleChange}
        name="password"
        value={formValues.password}
        required
      />
      <button className="btn btn-primary w-100" onClick={login}>
        Login
      </button>
    </div>
  );
};

export default Login;
