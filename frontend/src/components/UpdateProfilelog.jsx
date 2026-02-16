import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Howl } from "howler";
import { Camera } from "lucide-react";

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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const formData = new FormData();
      formData.append("name", name || usere?.fullname);
      formData.append("sem", semester || usere?.semester);
      if (file) {
        formData.append("file", file);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/user/updateuser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
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
      setopen(false);
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Update Profile</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Update your semester, name, and profile picture.
          </DialogDescription>
        </DialogHeader>

        {/* Profile image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-[120px] h-[120px] rounded-full cursor-pointer group">
            <img
              src={preview || usere?.picture || "/default.png"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-[3px] border-gradient-to-r from-red-500 via-yellow-500 to-purple-600"
            />
            <label
              htmlFor="profile-pic"
              className="absolute bottom-2 right-2 bg-black/70 p-2 rounded-full cursor-pointer hover:bg-black/90"
            >
              <Camera className="w-5 h-5 text-white" />
            </label>
            <input
              id="profile-pic"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler}>
          <div className="grid gap-4 py-4">
            {/* Name Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-slate-700 dark:text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                placeholder={usere?.fullname || "Enter your name"}
                className="col-span-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Semester Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right text-slate-700 dark:text-slate-300">
                Semester
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {semester ? semester : usere?.semester || "Select Semester"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <DropdownMenuRadioGroup
                    value={semester}
                    onValueChange={setsemester}
                  >
                    <DropdownMenuRadioItem value="first" className="dark:text-white dark:focus:bg-slate-700">
                      First
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="second" className="dark:text-white dark:focus:bg-slate-700">
                      Second
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="third" className="dark:text-white dark:focus:bg-slate-700">
                      Third
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fourth" className="dark:text-white dark:focus:bg-slate-700">
                      Fourth
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fifth" className="dark:text-white dark:focus:bg-slate-700">
                      Fifth
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sixth" className="dark:text-white dark:focus:bg-slate-700">
                      Sixth
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="seventh" className="dark:text-white dark:focus:bg-slate-700">
                      Seventh
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="eighth" className="dark:text-white dark:focus:bg-slate-700">
                      Eighth
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-green-400 hover:bg-green-500 text-white" type="submit">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfilelog;
