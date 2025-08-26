import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const QuizCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" /> {/* Subject Name */}
        <Skeleton className="h-4 w-1/2" />       {/* Description */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-2/3 mb-2" /> {/* Department */}
        <Skeleton className="h-4 w-1/2" />      {/* Teacher */}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/3" />      {/* Semester */}
      </CardFooter>
    </Card>
  );
};

export default QuizCardSkeleton;
