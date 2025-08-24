import React from "react";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import useGetSubject from "../../hook/useGetSubject";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Quiz = () => {
  const { usere } = useSelector((store) => store.auth);
  useGetSubject(`${usere.department}`);

  const { subjectByquiry } = useSelector((store) => store.subject);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Subjects</h2>

         
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-19">
          {subjectByquiry?.map((sub, i) => (
            <Card key={i} className="w-full ">
              <CardHeader>
                <CardTitle>{sub?.subjectName}</CardTitle>
                <CardDescription>{sub?.description}</CardDescription>
                
              </CardHeader>
              <CardContent>
                <p>Department: {sub?.department}</p>
                <p>Teacher: {sub?.createdBy?.fullname}</p>
              </CardContent>
              <CardFooter>
                <p>Semester: {sub?.semester}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Quiz;
