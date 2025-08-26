import React from "react";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";

const SchlitonSubject = () => {
  const subjects = [1, 2, 3, 4, 5]; // number of skeleton cards

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
       
    >
      {subjects.map((_, index) => (
        <div
          key={index}
          className="border rounded-xl shadow-md p-4 bg-white"
        >
         
          <Skeleton className="h-6 w-3/4 mb-3 rounded bg-gray-300" />
 
          <Skeleton className="h-4 w-1/2 mb-2 rounded bg-gray-300" />

         
          <Skeleton className="h-4 w-1/3 mb-4 rounded bg-gray-300" />

           
          <div className="my-3">
            <Skeleton className="h-10 w-25 rounded-lg bg-gray-300" />
          </div>

          
          <div className="my-3">
            <Skeleton className="h-10 w-19 rounded-lg bg-gray-300" />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default SchlitonSubject;
