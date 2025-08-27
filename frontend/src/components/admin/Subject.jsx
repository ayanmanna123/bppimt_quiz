import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SchlitonSubject from "./SchlitonSubject";
const Subject = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSubjects = async () => {


      
      try {
        const token = await getAccessTokenSilently({
          
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/subject/teacher/subject",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubjects(res.data.allSubject);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubjects();
  }, [getAccessTokenSilently]);

  return (
    <>
      <Navbar />
      <div className="mx-4.5 max-w-full hover:cursor-pointer flex justify-between items-center">
        <div onClick={() => navigate("/")}>
          {" "}
          <ArrowLeft />
        </div>
        <div onClick={() => navigate("/admin/create/subject")}>
          <Button className={"bg-blue-500 hover:bg-blue-600 cursor-pointer"}>
            Creat New Subject
          </Button>
        </div>
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Subjects</h1>

        {subjects.length === 0 ? (
          <SchlitonSubject/>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {subjects.map((subj) => (
              <div
                key={subj._id}
                className="border rounded-xl shadow-md p-4 hover:shadow-lg transition bg-white"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {subj.subjectName}
                </h2>
                <p className="text-sm text-gray-600">
                  <strong>Department:</strong> {subj.department}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Semester:</strong> {subj.semester}
                </p>

                <div className="my-3">
                  <Button
                    className={"bg-blue-500 hover:bg-blue-600 cursor-pointer"}
                    onClick={() => navigate(`/admin/createQuize/${subj._id}`)}
                  >
                    Create quiz
                  </Button>
                </div>
                <div className="my-3 ">
                  <Button
                    onClick={() => navigate(`/Admin/subject/quiz/${subj._id}`)}
                    className={"bg-green-500 hover:bg-green-600 cursor-pointer"}
                  >
                    view quiz
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Subject;
