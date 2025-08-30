// hooks/useGetSubject.js
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setsubjectByquiry } from "../Redux/subject.reducer";
import { useAuth0 } from "@auth0/auth0-react";  // assuming you use Auth0
import { toast } from "sonner";

const useGetSubject = (department) => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/subject/subjectByQuery?department=${department}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        dispatch(setsubjectByquiry(res.data.subjects));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    if (department) {
      fetchSubjects();
    }
  }, [department, dispatch, getAccessTokenSilently]);
};

export default useGetSubject;
