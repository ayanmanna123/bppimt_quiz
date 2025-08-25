import axios from "axios";
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const CreateSubject = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjectName, setSubjectName] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
    const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "http://localhost:5000/api/v1/subject/creatsubject",
        {
          department,
          semester,
          subjectName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubjectName("");
      setSemester("");
      setDepartment("");
      navigate("/Admin/subject")
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-md">
      <h1 className="font-bold text-2xl mb-5 text-center">Create Subject</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Subject Name */}
        <Input
          type="text"
          placeholder="Enter Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          required
        />

        {/* Department Dropdown */}
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

        {/* Semester Dropdown */}
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

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Create Subject
        </Button>
      </form>
    </div>
  );
};

export default CreateSubject;
