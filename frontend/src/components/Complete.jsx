import { useSelector, useDispatch } from "react-redux";
import { store } from "../Redux/store";
import { Input } from "./ui/input";
import axios from "axios";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setuser } from "../Redux/auth.reducer";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Complete = () => {
  const { usere } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Separate states for each dropdown
  const [role, setRole] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [semester, setSemester] = React.useState("");
  const navigate = useNavigate();
  const {
    logout,
    loginWithRedirect,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const handelsubmite = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/createuser",
        {
          fullname: user?.name,
          email: user?.email,
          picture: user?.picture,
          role,
          department,
          semester,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setuser(res.data.createrduser));

      console.log("User created:", res.data.createrduser);
      navigate("/");
    } catch (error) {
      console.log(
        "Error creating user:",
        error.response?.data || error.message
      );
    }
  };

  React.useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const token = await getAccessTokenSilently({
            audience: "http://localhost:5000/api/v2",
          });

          const res = await axios.get(
            `http://localhost:5000/api/v1/user/${user.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data?.success) {
            dispatch(setuser(res.data.user));
            navigate("/");
          }
        } catch (err) {
          console.log("User not found, needs to complete profile");
        }
      }
    };

    checkUser();
  }, [isAuthenticated, user, getAccessTokenSilently, dispatch, navigate]);

  return (
    <>
    <h1 className="font-bold text-2xl">
      complete the regestation
    </h1>
    <div className="flex justify-center gap-3.5 mt-9 ">
    
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{role || "Select Role"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
              <DropdownMenuRadioItem value="student">
                Student
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="teacher">
                Teacher
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {department || "Select Department"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Department</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={department}
              onValueChange={setDepartment}
            >
              <DropdownMenuRadioItem value="EE">EE</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ECE">ECE</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="CSE">CSE</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="IT">IT</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{semester || "Select Semester"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Semester</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={semester}
              onValueChange={setSemester}
            >
              <DropdownMenuRadioItem value="first">First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="second">
                Second
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="third">Third</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fourth">
                Fourth
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fifth">Fifth</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sixth">Sixth</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="seventh">
                Seventh
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="eighth">
                Eighth
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button onClick={handelsubmite}>
        Submit
      </Button>
    </div>
    </>
  );
};

export default Complete;
