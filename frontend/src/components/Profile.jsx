import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Pen } from "lucide-react";
import { Label } from "./ui/label";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Navbar from "./shared/Navbar";
import UpdateProfilelog from "./UpdateProfilelog";
import Dashboard from "./pages/Dashboard";

const Profile = () => {
  let [open, setopen] = useState(false);
  const { usere } = useSelector((store) => store.auth);

  return (
    <div>
      <Navbar />

      <div className="flex gap-6 px-6 py-14">
        <motion.div
          className="w-2xs bg-white border border-gray-300 rounded-2xl p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex gap-6 justify-between items-center">
            <div className="flex items-center gap-4">
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
              className="text-right"
              variant="outline"
            >
              <Pen />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-md font-bold">{usere?.email}</Label>
            <Label className="text-md font-bold">Role: {usere?.role}</Label>
            <Label className="text-md font-bold">
              Department: {usere?.department}
            </Label>
            <Label className="text-md font-bold">
              Semester: {usere?.semester}
            </Label>
          </div>

          <UpdateProfilelog open={open} setopen={setopen} />
        </motion.div>
        <div className="w-6xl">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default Profile;
