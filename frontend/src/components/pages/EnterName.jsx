import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setuser } from "../../Redux/auth.reducer";
import { Howl } from "howler";

const EnterName = () => {
  const [semester, setSemester] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { usere } = useSelector((store) => store.auth);

  // Send verification code
  const sendCodeHandler = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      await axios.post(
        "http://localhost:5000/api/v1/user/send-code",
        {
          email: usere?.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Verification code sent to your email!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const verifyCodeHandler = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/verify-code",
        {
          email: usere?.email,
          code,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Code verified!");
        setIsVerified(true);
      } else {
        toast.error("Invalid code!");
        setIsVerified(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed!");
    }
  };

  // Submit handler
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error("Please verify your code first!");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.put(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/updateuser",
        { sem: semester, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(setuser(res.data.user));

      const sound = new Howl({ src: ["/notification.wav"], volume: 0.7 });
      sound.play();

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Update failed!");
    }
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="col-span-3"
        />

        <div className="mt-4">
          <p>
            We will send a verification code to this email:{" "}
            <b>{usere?.email}</b>
          </p>
          <Button
            type="button"
            onClick={sendCodeHandler}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 mt-2"
          >
            {loading ? "Sending..." : "Send Code"}
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <Button
            type="button"
            onClick={verifyCodeHandler}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Verify
          </Button>
        </div>

        <Button
          className="bg-green-500 hover:bg-green-600 mt-4"
          type="submit"
          disabled={!isVerified}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default EnterName;
