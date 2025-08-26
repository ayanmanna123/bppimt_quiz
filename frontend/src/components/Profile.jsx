import React, { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "./ui/label";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { store } from "@/Redux/store";
import Navbar from "./shared/Navbar";
import UpdateProfilelog from "./UpdateProfilelog";

// const skilles = ["React", "Node.js", "Tailwind", "MongoDB"];

const Profile = () => {
  const ishaveresume = true;
  let [open, setopen] = useState(false);
  const { usere } = useSelector((store) => store.auth);
  return (
    <div>
      <Navbar />
      <motion.div
        className="max-w-4xl   mx-auto bg-white border border-gray-300 rounded-2xl my-5 p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex  gap-6 justify-between">
          <div className="flex items-center gap-4 ">
            <Avatar className="h-24 w-24">
              <AvatarImage
                className="object-cover"
                src={
                  usere?.picture ||
                  `https://api.dicebear.com/6.x/initials/svg?seed=${usere?.fullname}`
                }
              />
              <AvatarFallback>{usere?.fullname?.[0] || "U"}</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-medium text-xl">{usere?.fullname}</h1>
            </div>
          </div>
          <Button
            onClick={() => setopen(true)}
            className={"text-right"}
            variant={"outline"}
          >
            <Pen />
          </Button>
        </div>
        <div>
          <div className="py-1.5">
            <Label className="text-md font-bold">{usere?.email}</Label>
          </div>
          <div className="py-1.5">
            <Label className="text-md font-bold"> Role: {usere?.role}</Label>
          </div>
          <div className="py-1.5">
            <Label className="text-md font-bold">
              department: {usere?.department}
            </Label>
          </div>
          <div className="py-1.5">
            <Label className="text-md font-bold">
              semester: {usere?.semester}
            </Label>
          </div>
        </div>
        <div>
          <UpdateProfilelog open={open} setopen={setopen} />
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
