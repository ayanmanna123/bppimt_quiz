import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setuser } from "../Redux/auth.reducer";

// Dropdown imports
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const UpdateProfilelog = ({ open, setopen }) => {
  const [semester, setsemester] = useState("");
  const [name, setname] = useState("");
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.put(
        "http://localhost:5000/api/v1/user/updateuser",
        { sem: semester, name }, // send both sem and name
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setuser(res.data.user));
      toast.success(res.data.message);
      setopen(false);  
    } catch (error) {
      console.log(error);
      toast.error("Update failed!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your semester and name here.
          </DialogDescription>
        </DialogHeader>

        {/* Profile image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-[120px] h-[120px] rounded-full cursor-pointer group">
            <img
              src={usere?.picture || "/default.png"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-[3px] border-gradient-to-r from-red-500 via-yellow-500 to-purple-600"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler}>
          <div className="grid gap-4 py-4">
            
            {/* Name Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                placeholder={usere?.name || "Enter your name"}
                className="col-span-3"
              />
            </div>

            {/* Semester Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-between"
                  >
                    {semester ? semester : "Select Semester"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={semester}
                    onValueChange={setsemester}
                  >
                    <DropdownMenuRadioItem value="first">First</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="second">Second</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="third">Third</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fourth">Fourth</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fifth">Fifth</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sixth">Sixth</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="seventh">Seventh</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="eighth">Eighth</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-green-400 hover:bg-green-500" type="submit">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfilelog;
