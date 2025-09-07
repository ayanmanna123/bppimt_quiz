import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Target } from "lucide-react";
import { Button } from "../ui/button";
const EnterName = () => {
  const [semester, setsemester] = useState("");
  const [name, setname] = useState("");
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.put(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/updateuser",
        { sem: semester, name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setuser(res.data.user));

      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      toast.error("Update failed!");
    }
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        {" "}
        <Input
          id="name"
          value={name}
          onChange={(e) => setname(e.target.value)}
          placeholder={"Enter your name"}
          className="col-span-3"
        />
        <Button className="bg-green-500 hover:bg-green-600" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default EnterName;
